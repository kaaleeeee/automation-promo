// Sync folder lokal ke branch GitHub pakai Contents API (one file at a time).
// Reliable daripada git data API untuk tree besar dengan banyak subfolder.
const fs = require('fs');
const path = require('path');

const TOK = process.env.GH_TOKEN;
const REPO = 'kaaleeeee/automation-promo';
const BRANCH = 'main';
const API = `https://api.github.com/repos/${REPO}`;

if (!TOK) { console.error('GH_TOKEN required'); process.exit(1); }

const headers = {
  Authorization: `token ${TOK}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

const SKIP_DIRS = new Set(['node_modules', '.next', '.git']);
const SKIP_PATTERNS = [/^\.env/, /\.log$/, /(^|\/)dev\.db$/];

function walk(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full).replace(/\\/g, '/');
    if (SKIP_DIRS.has(rel) || SKIP_PATTERNS.some((re) => re.test(rel))) continue;
    if (entry.isDirectory()) out.push(...walk(full, base));
    else out.push([rel, full]);
  }
  return out;
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function putFile(rel, full, remoteSha) {
  const content = fs.readFileSync(full);
  const body = {
    message: `chore: sync ${rel}`,
    content: content.toString('base64'),
    encoding: 'base64',
    branch: BRANCH,
  };
  if (remoteSha) body.sha = remoteSha;

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${API}/contents/${encodeURIComponent(rel)}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) return { ok: true, sha: data.content?.sha };
    if (res.status === 409 || data.message?.includes('lock')) {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    return { ok: false, error: data.message };
  }
  return { ok: false, error: 'retries exhausted' };
}

async function getRemoteTree() {
  const res = await fetch(`${API}/git/trees/${BRANCH}?recursive=1`, { headers });
  const data = await res.json();
  return new Map((data.tree || []).filter((e) => e.type === 'blob').map((e) => [e.path, e.sha]));
}

async function main() {
  const root = path.resolve(__dirname);
  const files = walk(root);
  const remote = await getRemoteTree();

  console.log(`local files: ${files.length}, remote blobs: ${remote.size}`);

  let changed = 0;
  let unchanged = 0;
  let failed = [];

  for (const [rel, full] of files) {
    // bandingkan sha via hash-object (sudah normalize CRLF)
    const { execFileSync } = require('child_process');
    const localSha = execFileSync('git', ['hash-object', path.resolve(full)])
      .toString()
      .trim();

    if (remote.get(rel) === localSha) {
      unchanged++;
      continue;
    }

    const result = await putFile(rel, full, remote.get(rel));
    if (result.ok) {
      changed++;
      if (changed % 20 === 0) console.log(`progress: ${changed} updated...`);
    } else {
      failed.push({ path: rel, error: result.error });
      console.warn(`FAIL ${rel}: ${result.error}`);
    }
    // throttle ringan agar tidak kena rate limit sekunder
    await sleep(120);
  }

  // hapus file remote yang tidak ada lokal (kecuali push-to-github.cjs sendiri)
  const localSet = new Set(files.map(([rel]) => rel));
  const toDelete = [...remote.keys()].filter((p) => !localSet.has(p) && p !== 'push-to-github.cjs');
  for (const rel of toDelete) {
    const res = await fetch(`${API}/contents/${encodeURIComponent(rel)}?ref=${BRANCH}`, { headers });
    const data = await res.json();
    if (!data.sha) continue;
    const del = await fetch(`${API}/contents/${encodeURIComponent(rel)}`, {
      method: 'DELETE',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `chore: remove ${rel}`, sha: data.sha, branch: BRANCH }),
    });
    if (!del.ok) console.warn(`DEL FAIL ${rel}`);
    await sleep(120);
  }

  console.log(JSON.stringify({ changed, unchanged, deleted: toDelete.length, failedCount: failed.length }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
