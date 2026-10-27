// Weekly local growth report for DriveDE. Runs growth-collect.mjs and the Supabase trial report,
// tolerates the PostHog/CDP step failing (Chrome 9222 closed), stores a snapshot JSON per run in
// ~/.claude/dashboards/growth/weekly/<date>.json, compares it with the previous snapshot and writes
// <date>.md (table, flags, one experiment suggested by the claude CLI when it is installed).
// Scheduled by scripts/analytics/register-weekly-task.ps1. Usage: node scripts/analytics/weekly-report.mjs
import { spawnSync, spawn } from 'node:child_process';
import { writeFileSync, readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(os.homedir(), '.claude', 'dashboards', 'growth', 'weekly');
mkdirSync(OUT, { recursive: true });
const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
const notes = [];

const run = (script) => spawnSync(process.execPath, [path.join(ROOT, script)], { cwd: ROOT, encoding: 'utf8', timeout: 15 * 60e3, maxBuffer: 32 * 1024 * 1024 });
const jsonAfter = (line, key) => { try { return JSON.parse(line.slice(key.length).trim()); } catch { return null; } };

// 1. growth-collect: Vercel + Supabase print before the PostHog step, which needs Chrome on 9222.
const gc = run('scripts/analytics/growth-collect.mjs');
const gcOut = gc.stdout || '';
const gcErr = `${gc.stderr || ''}`;
let visitors7d = null, emailSignups7d = null;
for (const line of gcOut.split('\n')) {
  if (line.startsWith('vercel [')) visitors7d = jsonAfter(line, 'vercel')?.find((w) => w.window === '7d')?.visitors ?? null;
  if (line.startsWith('signups [')) emailSignups7d = jsonAfter(line, 'signups')?.find((r) => r.range === '7d')?.with_email ?? null;
}
if (gc.status !== 0) {
  if (/ECONNREFUSED[^\n]*9222/.test(gcErr)) notes.push('PostHog skipped: Chrome 9222 not open');
  else notes.push(`growth-collect failed (exit ${gc.status}): ${gcErr.trim().split('\n').find((l) => /error/i.test(l)) || 'see log'}`);
}
if (visitors7d === null) notes.push('Vercel visitors 7d unavailable');

// 2. trial-report: "  key   value" lines.
const tr = run('scripts/supabase/trial-report.mjs');
const acc = {};
for (const m of (tr.stdout || '').matchAll(/^\s+(\w+)\s+(\d+)\s*$/gm)) acc[m[1]] = Number(m[2]);
if (tr.status !== 0 || !('accounts_total' in acc)) notes.push(`trial-report failed: ${(tr.stderr || '').trim().split('\n')[0] || 'no output'}`);

const snap = {
  date: today,
  visitors_7d: visitors7d,
  new_accounts_7d: acc.created_last_7d ?? null,
  email_signups_7d: emailSignups7d,
  with_email: acc.with_email ?? null,
  expired_without_email: acc.expired_without_email ?? null,
  trials_running: acc.trials_running ?? null,
  premium: acc.premium ?? null,
  accounts_total: acc.accounts_total ?? null,
};
writeFileSync(path.join(OUT, `${today}.json`), JSON.stringify(snap, null, 2));

// 3. Previous snapshot = latest file dated before today.
const prevFile = readdirSync(OUT).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f) && f < `${today}.json`).sort().pop();
const prev = prevFile ? JSON.parse(readFileSync(path.join(OUT, prevFile), 'utf8')) : null;

const ROWS = [
  ['Visitors 7d', 'visitors_7d'], ['New accounts 7d', 'new_accounts_7d'], ['New email signups 7d', 'email_signups_7d'],
  ['With email (total)', 'with_email'], ['Expired without email', 'expired_without_email'],
  ['Trials running', 'trials_running'], ['Premium', 'premium'],
];
const fmt = (v) => (v === null || v === undefined ? 'n/a' : String(v));
const delta = (a, b) => (typeof a === 'number' && typeof b === 'number' ? (a - b > 0 ? `+${a - b}` : String(a - b)) : '');
let md = `# DriveDE weekly growth report ${today}\n\n`;
md += prev ? `Compared with ${prev.date}.\n\n` : 'First snapshot, no previous week to compare.\n\n';
md += '| Metric | This week | Last week | Change |\n|---|---|---|---|\n';
for (const [label, k] of ROWS) md += `| ${label} | ${fmt(snap[k])} | ${prev ? fmt(prev[k]) : 'n/a'} | ${prev ? delta(snap[k], prev[k]) : ''} |\n`;

const flags = [];
if (prev && snap.expired_without_email > prev.expired_without_email) flags.push(`Expired without email grew by ${snap.expired_without_email - prev.expired_without_email} (${prev.expired_without_email} to ${snap.expired_without_email}): trials end and users leave without an email.`);
if (snap.email_signups_7d === 0) flags.push('0 email signups in the last 7 days.');
else if (prev && snap.with_email === prev.with_email) flags.push('With email total did not grow since last week.');
if (prev && typeof snap.visitors_7d === 'number' && typeof prev.visitors_7d === 'number' && snap.visitors_7d < prev.visitors_7d) flags.push(`Visitors fell by ${prev.visitors_7d - snap.visitors_7d}.`);
if (snap.new_accounts_7d === 0) flags.push('No new accounts in the last 7 days.');
if (snap.premium === 0) flags.push('No premium users.');
md += `\n## Flags\n\n${flags.length ? flags.map((f) => `- ${f}`).join('\n') : '- None.'}\n`;
if (notes.length) md += `\n## Notes\n\n${notes.map((n) => `- ${n}`).join('\n')}\n`;

// 4. Experiment suggestion through the claude CLI (headless, cheap model, no tools).
const findClaude = () => {
  const w = spawnSync('where.exe', ['claude'], { encoding: 'utf8' });
  if (w.status === 0) return w.stdout.split(/\r?\n/).find((l) => l.trim()) || null;
  for (const p of [path.join(os.homedir(), '.local', 'bin', 'claude.exe'), path.join(process.env.APPDATA || '', 'npm', 'claude.cmd')]) if (existsSync(p)) return p;
  // the IDE extension ships its own binary in a versioned folder: take the newest
  for (const ide of ['.antigravity-ide', '.vscode', '.cursor']) {
    const dir = path.join(os.homedir(), ide, 'extensions');
    if (!existsSync(dir)) continue;
    const ext = readdirSync(dir).filter((d) => d.startsWith('anthropic.claude-code-'))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    for (const d of ext) {
      const p = path.join(dir, d, 'resources', 'native-binary', 'claude.exe');
      if (existsSync(p)) return p;
    }
  }
  return null;
};
const claudeBin = findClaude();
let exp = '';
if (!claudeBin) exp = 'Experiment suggestion skipped: claude CLI not found on PATH.';
else {
  const prompt = `${md}\n---\nYou advise a small German driving-theory app (DriveDE) with a 7 day anonymous trial. From this weekly report, propose exactly ONE experiment for next week. Reply in plain markdown with four short lines: Hypothesis, Change, Metric, Success threshold. No em dashes or en dashes.`;
  const r = spawnSync(claudeBin, ['-p', '--model', 'sonnet', '--tools', ''], { input: prompt, encoding: 'utf8', timeout: 3 * 60e3, shell: /\.(cmd|bat)$/i.test(claudeBin) });
  const text = (r.stdout || '').trim();
  exp = r.status === 0 && text ? text.replace(/[–—]/g, '-') : `Experiment suggestion skipped: claude -p failed (${r.error?.message || (r.stderr || '').trim().split('\n')[0] || `exit ${r.status}`}).`;
}
md += `\n## Experiment for next week\n\n${exp}\n`;
writeFileSync(path.join(OUT, `${today}.md`), md);
console.log(`weekly report written: ${path.join(OUT, `${today}.md`)}`);

// 5. Toast, fire and forget. Failure is ignored: the file is the result.
try {
  const body = (flags.length ? flags[0] : 'No flags this week.').replace(/'/g, "''");
  const ps = `[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null; $x = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent('ToastText02'); $t = $x.GetElementsByTagName('text'); $t.Item(0).AppendChild($x.CreateTextNode('DriveDE weekly growth report')) | Out-Null; $t.Item(1).AppendChild($x.CreateTextNode('${body}')) | Out-Null; [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe').Show([Windows.UI.Notifications.ToastNotification]::new($x))`;
  spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-Command', ps], { detached: true, stdio: 'ignore' }).unref();
} catch { /* no toast */ }
