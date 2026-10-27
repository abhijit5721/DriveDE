// Reliable "did this account already comment in this thread" lookup, shared by post.mjs and reply.mjs.
// A big thread only renders the first page of comments, so counting shreddit-comment[author=ME] on the
// default view misses older own comments (caused a double post in a 270-comment r/germany thread, 2026-10-27).
// Two independent checks, either one is enough:
//   1. thread loaded with ?sort=new (a just-posted comment sits on top)
//   2. own profile comments list (logged-in session, scrolled), permalink contains /comments/<threadId>/
// Optional needle: only count a comment whose text includes it (used to verify a specific draft landed).
// Read-only: opens its own tab, never posts. Returns { found, via, commentId } or { found: false }.
export const threadId = (url) => (url.match(/\/comments\/([a-z0-9]+)/) || [])[1];

export async function findOwnComment(ctx, { me, url, needle = '', scrolls = 6 }) {
  const id = threadId(url);
  if (!id) throw new Error(`no thread id in ${url}`);
  const page = await ctx.newPage();
  try {
    // 1. thread, newest first
    const u = new URL(url); u.search = '?sort=new';
    await page.goto(u.toString(), { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);
    const inThread = await page.evaluate(({ me, needle }) => {
      const c = [...document.querySelectorAll(`shreddit-comment[author="${me}"]`)].find((e) => !needle || (e.innerText || '').includes(needle));
      return c ? (c.getAttribute('thingid') || '') : null;
    }, { me, needle });
    if (inThread !== null) return { found: true, via: 'thread?sort=new', commentId: inThread.replace(/^t1_/, '') };
    // 2. own profile comments, scroll to load older pages
    await page.goto(`https://www.reddit.com/user/${me}/comments/?sort=new`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);
    let last = -1;
    for (let i = 0; i <= scrolls; i++) {
      const hit = await page.evaluate(({ id, needle }) => {
        const c = [...document.querySelectorAll('shreddit-profile-comment')].find((e) => (e.getAttribute('href') || '').includes(`/comments/${id}/`) && (!needle || (e.innerText || '').includes(needle)));
        return c ? (c.getAttribute('comment-id') || '') : null;
      }, { id, needle });
      if (hit !== null) return { found: true, via: 'profile', commentId: hit.replace(/^t1_/, '') };
      const n = await page.locator('shreddit-profile-comment').count();
      if (n === last) break; // nothing new loaded, end of list
      last = n;
      await page.mouse.wheel(0, 20000);
      await page.waitForTimeout(1800);
    }
    return { found: false };
  } finally {
    await page.close().catch(() => {});
  }
}
