// Post approved replies from content/social-media/outreach-2026-09-08.md as
// the logged-in DriveDE account via CDP Chrome. Usage: node reddit-post.tmp.mjs A B F
import { chromium } from 'playwright';

const OVERVIEW = 'https://www.drivede.app/blog/convert-foreign-licence-germany-overview/?utm_source=reddit&utm_medium=comment&utm_campaign=umschreibung-2026-08';
const FAILED = 'https://www.drivede.app/blog/failed-german-driving-test/?utm_source=reddit&utm_medium=comment&utm_campaign=failed-test';
const LESSONS = 'https://www.drivede.app/blog/how-many-driving-lessons-germany/?utm_source=reddit&utm_medium=comment&utm_campaign=lessons';
const US = 'https://www.drivede.app/blog/convert-us-drivers-license-germany/?utm_source=reddit&utm_medium=comment&utm_campaign=us-conversion';

const REPLIES = {
  A: {
    url: 'https://www.reddit.com/r/germany/comments/1w68jzg/new_german_driving_licence_rule_18_aug_2026/',
    text: `Yes, this is exactly the case the amendment covers. Until 18 August 2026, §28(4) Nr. 7 FeV said Germany would not recognise an EU licence that had been obtained by exchanging a non-EU licence from a country outside Anlage 11 (yours would carry a code 70 with MAR on the back). That exclusion was removed. ADAC's summary: "Außerdem werden Führerscheine aus Drittstaaten, die bereits in einem anderen EU-Staat umgetauscht wurden, in Deutschland anerkannt."

Practically: your French licence is now an ordinary EU licence in Germany, so there is no 6-month limit and you do not have to exchange it at all. If you want a German card anyway (some people do for insurance or employer reasons), it is a plain EU exchange, no exams.

Two cautions. Some Führerscheinstellen still have the old text on their websites and some caseworkers have not read the memo, so if you get pushback, ask them to check the current §28 FeV, not their intranet. And this comes from the ADAC page you linked plus the FeV text at gesetze-im-internet; I am not a lawyer, and for anything with a police stop or insurance claim at stake, a written confirmation from your Führerscheinstelle is worth the email.

Disclosure: I build DriveDE, a free app for people going through the German licence process. We just updated our conversion overview for the 18 August changes: ${OVERVIEW}`,
  },
  B: {
    url: 'https://www.reddit.com/r/germany/comments/1w54sz1/eu_driving_licence_exchanged_from_a_noneu_licence/',
    text: `You have done the legal homework better than most caseworkers will have, so the only honest answer is: the law is on your side as of 18 August, and the first weeks after a change like this are when counters give inconsistent answers. What has worked for people in the Anlage 11 changes in past years:

1. Email first, not phone. Ask a single question: "Wird mein finnischer Führerschein (Code 70.TUR) nach der Änderung des §28 Abs. 4 Nr. 7 FeV zum 18.08.2026 in Deutschland anerkannt?" and cite the BGBl 2026 I Nr. 236 you already found. A written yes is what you want in the glovebox.
2. If the answer is a copy-paste of the old rule, reply with the gesetze-im-internet link to the current §28 and ask them to confirm against the current text. That usually ends it.
3. Nothing forces you to exchange. Your Finnish card is now simply an EU licence here. Exchange only if you want a German card for other reasons.

If you do get a written answer, please post it here. This thread is going to be the top search result for "code 70 Germany 2026" within a month and the next person will need it.

Disclosure: I build DriveDE, a free trainer for the German licence process. Our conversion overview is updated for the 18 August rule: ${OVERVIEW}`,
  },
  C: {
    url: 'https://www.reddit.com/r/germany/comments/1vxev5s/i_failed_my_first_practical_driving_exam/',
    text: `The others are right that 18 hours is on the low side, but I want to add the part nobody has said: the thing that failed you is a specific, trainable skill, not "experience" in general. Narrow street, curve to the right, obstacle on your side: the correct move is to slow down early, hold your lane position, and if the gap is not clearly enough for both mirrors, stop and let oncoming traffic pass. Your instructor grabbed the wheel because you were about to take the gap at speed. That is a judgement-of-width problem, and it responds very well to targeted practice: ask your instructor for two lessons that are nothing but narrow residential streets with parked cars, both directions, and have them call out "would this fit?" before every gap.

Also: an intervention fail is the most common kind of first fail in Germany, and examiners see it as normal, not as a mark against you on the retake. The Prüfer next time does not know about this one.

Disclosure: I build DriveDE, a free app for the German practical test. The bit that might help you specifically is the maneuver trainer, and the post on what to do after a failed test: ${FAILED}`,
  },
  D: {
    url: 'https://www.reddit.com/r/germany/comments/1wa3yo6/how_often_did_you_have_your_driving_classes_in/',
    text: `Two a week is normal and honestly fine in the middle phase. The gaps matter much more at the end: the last 6 to 8 lessons before the exam should be bunched close together, ideally with the exam a few days after the last one, because what you lose in a two-week gap is not skill but rhythm (mirror routine, shoulder check timing, clutch feel). So: do not switch now, but do tell your instructor now that you want the final block dense, and get the exam date booked early enough that the TÜV slot lines up with it. In many cities the TÜV waiting time, not the school, is what stretches this out.

Between lessons, the cheapest thing you can do is keep the routines warm: sit in any parked car and run the full start-up and turn sequence out loud (mirrors, shoulder, signal, go). It sounds silly and it is exactly what examiners watch for.

Disclosure: I build DriveDE, a free trainer app for exactly this in-between time. The guide on lesson counts is here if useful: ${LESSONS}`,
  },
  E: {
    url: 'https://www.reddit.com/r/germany/comments/1w4i2kc/driving_license_tips/',
    text: `On the money question specifically, since that is what you asked: the whole cost of a conversion is decided by how many paid driving lessons you need before the practical exam, because as a converter you have zero mandatory hours. Everything else (application, translation, theory exam fee, practical exam fee, school admin fee) is roughly fixed at 500 to 700 euros. So the lever is: arrive at the first lesson already driving the German way.

Concretely, before you pay for lesson one: learn the examiner commands in German (they are short and standardised), learn rechts vor links until it is reflex, and practise the shoulder check as a visible head turn on every turn and lane change. Converters who do this typically pass with 5 to 10 lessons. Converters who show up as experienced drivers and expect the instructor to "polish" them typically need 15 to 20, because they spend paid hours unlearning habits.

Also check which list your country is on before assuming you need exams at all; that list changed on 18 August 2026.

Disclosure: I build DriveDE, a free app with a conversion mode. Overview of which countries need which exams: ${OVERVIEW}`,
  },
  F: {
    url: 'https://www.reddit.com/r/hamburg/comments/1w2ix02/fahrschule_mit_mehrsprachigen_fahrlehrern/',
    text: `Moin, ein Gedanke zusätzlich zur Fahrschulsuche: Die praktische Prüfung selbst ist auf Deutsch, aber die Prüferkommandos sind kurz und immer dieselben ("an der nächsten Kreuzung links", "bitte wenden", "Gefahrbremsung"). Wenn deine Partnerin die 20 Standardkommandos vorher auswendig kann, fällt die Sprachbelastung im Auto fast weg, egal welche Fahrschule. Das nimmt oft mehr Druck raus als der englischsprachige Fahrlehrer, weil sie dann in der Prüfung nichts übersetzen muss.

Zur Fahrschule: Fahrschule Galaxy in Eilbek wurde ja schon genannt. Ansonsten lohnt sich ein Anruf bei den Schulen rund um den Hauptbahnhof und in St. Georg, dort ist der Anteil internationaler Schüler am höchsten.

(Ich baue nebenbei eine kostenlose Übungs-App für die Fahrprüfung, daher der Tipp mit den Kommandos. Wenn ihr die Liste wollt, sag Bescheid.)`,
  },
  G: {
    url: 'https://www.reddit.com/r/hamburg/comments/1vyvj4s/for_americans_from_exception_states_looking_to/',
    text: `Good write-up, thank you for doing this. Two additions from the last few weeks: (1) A commenter is right that California belongs on your list; as of 2026 California, Connecticut, Florida, Indiana, Minnesota, Mississippi, Missouri, Nebraska, North Carolina, Oregon, Tennessee and D.C. all need at least the theory exam, and some need both. Check the LBV page you linked for the exact column for your state; it is the authoritative table for Hamburg. (2) The 18 August 2026 FeV change did not add any US states, so nothing improved for the exception states, but it did change the rule for people who exchanged a US licence in another EU country first. That combination is rare but real (e.g. someone who lived in France before Hamburg).

For the theory prep itself: the official question catalogue is what the exam draws from, so any app that uses the licensed catalogue works. What most Americans underestimate is rechts vor links and the roundabout signalling rules, because those two differ from US practice in ways the questions test hard.

Disclosure: I build DriveDE, a free trainer for the German test. Our state-by-state US guide is here if useful: ${US}`,
  },
};

// Usage: node scripts/reddit/post.mjs A B            (built-in drafts above)
//        node scripts/reddit/post.mjs --file drafts.json 1 3
// where drafts.json is {"1": {"url": "...", "text": "..."}, ...}
import { readFileSync } from 'node:fs';
const argv = process.argv.slice(2);
const fileIdx = argv.indexOf('--file');
if (fileIdx !== -1) {
  const extra = JSON.parse(readFileSync(argv[fileIdx + 1], 'utf8'));
  Object.assign(REPLIES, extra);
  argv.splice(fileIdx, 2);
}
const keys = argv;
if (!keys.length) { console.error('give reply keys, e.g. A B F, or --file drafts.json 1 2'); process.exit(1); }
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
for (const k of keys) {
  const r = REPLIES[k];
  if (!r) { console.log(k, 'unknown'); continue; }
  try {
    await page.goto(r.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3500);
    // Open the top-level comment composer (new reddit). The collapsed host
    // renders no editable until clicked; the editor then lives in shadow DOM,
    // which Playwright CSS locators pierce.
    const host = page.locator('comment-composer-host').first();
    await host.waitFor({ timeout: 20000 });
    await host.scrollIntoViewIfNeeded();
    await host.click({ force: true });
    await page.waitForTimeout(1500);
    let box = page.locator('[contenteditable="true"]').first();
    if (!(await box.count())) {
      await page.locator('faceplate-textarea-input').first().click({ force: true });
      await page.waitForTimeout(1500);
      box = page.locator('[contenteditable="true"]').first();
    }
    await box.waitFor({ timeout: 20000 });
    await box.click();
    // Type paragraph by paragraph so line breaks survive the rich editor.
    const paras = r.text.split('\n\n');
    for (let i = 0; i < paras.length; i++) {
      const lines = paras[i].split('\n');
      for (let j = 0; j < lines.length; j++) {
        await page.keyboard.insertText(lines[j]);
        if (j < lines.length - 1) await page.keyboard.press('Shift+Enter');
      }
      if (i < paras.length - 1) { await page.keyboard.press('Enter'); await page.keyboard.press('Enter'); }
    }
    // Move the caret off the trailing link so the autolink tooltip does not
    // sit on top of the Comment button.
    await page.keyboard.press('Control+Home');
    await page.waitForTimeout(800);
    await page.screenshot({ path: `c:/Users/abhij/Downloads/DriveDE/demo-video/reddit-${k}-before.png`, timeout: 15000 }).catch(() => {});
    // Submit button lives inside the composer's shadow tree; scope to it so we
    // do not hit the post's "Comment" count button.
    const composer = page.locator('shreddit-composer').first();
    let submit = composer.locator('button[type="submit"]');
    if (!(await submit.count())) submit = composer.getByRole('button', { name: /^Comment$/ });
    if (!(await submit.count())) submit = page.locator('comment-composer-host').getByRole('button', { name: /^Comment$/ });
    await submit.first().click();
    await page.waitForTimeout(6000);
    await page.screenshot({ path: `c:/Users/abhij/Downloads/DriveDE/demo-video/reddit-${k}-after.png`, timeout: 15000 }).catch(() => {});
    // Verify against the rendered comment tree after a reload, not the editor.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const posted = await page.evaluate((needle) => {
      const tree = [...document.querySelectorAll('shreddit-comment')].map((c) => c.innerText || '').join('\n');
      return tree.includes(needle);
    }, r.text.slice(0, 50));
    console.log(`${k}: ${posted ? 'POSTED (verified in comment tree)' : 'NOT POSTED (not in comment tree after reload)'} ${r.url}`);
    await page.waitForTimeout(8000);
  } catch (e) {
    console.log(`${k}: ERROR ${e.message.slice(0, 160)}`);
    await page.screenshot({ path: `c:/Users/abhij/Downloads/DriveDE/demo-video/reddit-${k}-error.png`, timeout: 15000 }).catch(() => {});
  }
}
await page.close(); await browser.close();
