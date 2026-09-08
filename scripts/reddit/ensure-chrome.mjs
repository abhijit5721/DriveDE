// Make sure the automation Chrome (DriveDE Reddit session) is reachable over CDP.
// Chrome sometimes answers /json/version but hangs on attach after a stuck
// dialog; the only reliable fix is a restart, which keeps the logged-in profile.
// Usage: node scripts/reddit/ensure-chrome.mjs
import { chromium } from 'playwright';
import { execSync, spawn } from 'node:child_process';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\abhij\\drivede-social\\chrome-flow-profile';
const ARGS = ['--remote-debugging-port=9222', `--user-data-dir=${PROFILE}`, '--no-first-run', '--disable-session-crashed-bubble', '--hide-crash-restore-bubble', 'about:blank'];

async function healthy() {
  try {
    const b = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 10000 });
    const n = b.contexts()[0]?.pages().length ?? 0;
    await b.close();
    return { ok: true, pages: n };
  } catch (e) {
    return { ok: false, reason: e.message.split('\n')[0] };
  }
}

const first = await healthy();
if (first.ok) { console.log(`chrome OK (${first.pages} pages)`); process.exit(0); }
console.log(`chrome not usable: ${first.reason}; restarting`);
try {
  execSync(`powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='chrome.exe'\\" | Where-Object { $_.CommandLine -match 'chrome-flow-profile' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`, { stdio: 'ignore' });
} catch {}
await new Promise((r) => setTimeout(r, 3000));
spawn(CHROME, ARGS, { detached: true, stdio: 'ignore' }).unref();
await new Promise((r) => setTimeout(r, 8000));
const second = await healthy();
console.log(second.ok ? `chrome restarted OK (${second.pages} pages)` : `chrome still failing: ${second.reason}`);
process.exit(second.ok ? 0 : 1);
