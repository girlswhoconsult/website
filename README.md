# Girls Who Consult website

The Girls Who Consult (GWC) site: four pages (Home, About, Meet the Team, Contact), built with
[Astro](https://astro.build) and Tailwind CSS, with a content manager at `/admin` so the board can
update events, the team, mentors and more without touching code.

- **Live content lives in `src/content/`.** Every event, board member, mentor, program, resource and
  alumni logo is its own small file, and `stats.json` / `site.json` hold the numbers and links.
- **The content manager (Decap CMS) edits those same files** and commits them to GitHub, which
  triggers a rebuild on Netlify. Changes are live in about a minute.

---

## For the board: editing the site

1. Go to **`https://<your-site>/admin/`** and choose **Login with GitHub**. You need a GitHub
   account with write access to `girlswhoconsult/website` (ask whoever manages the repo to add you).
2. Pick a section in the sidebar:

| Section | What it controls |
|---|---|
| **Events** | Upcoming and past events on About (and the next three on Home). Add a sign-up link (Google Form, Luma…) to show a **Sign up** button. |
| **Team** | Meet the Team. **Order on page** controls the order. |
| **Mentors** | "Meet our mentors" on Home. The section stays hidden until at least one mentor is published. |
| **Programs** | Our Programs on About. Tick **Flagship** for the big panel (one program only). |
| **Resources** | Resource cards on About. |
| **Alumni logos** | The logo wall on Home. Use **Size adjustment** if a logo looks too small or large. |
| **Site settings → By the Numbers** | The pink numbers band and the three numbers in the home page hero. |
| **Site settings → Contact & links** | Email, social links, Slack, the board application link and its deadlines. |

3. **Review mode is on.** Clicking **Save** stores your change as a draft; nothing goes live yet.
   Open the **Workflow** tab to see drafts in three columns: *Drafts → In review → Ready*. Move a
   change to **Ready**, then click **Publish** to put it live. The site rebuilds in about a minute.
   (Behind the scenes each draft is a pull request on GitHub.)

**Good to know**

- **Review mode doesn't force a second person.** Anyone with access can publish their own change.
  The convention is that someone else moves it to Ready. To *require* a second approver, turn on
  GitHub branch protection for `main` with one required review; the reviewer then approves the pull
  request on GitHub before Publish works.
- **Hide on the live site:** entries with this ticked never appear on the live site, even after
  they're published (they still show in a local preview). Use it to prepare an event before
  announcing it.
- **Past events move themselves.** Once an event's end time (or start time if it has no end) has
  passed, it moves from "Upcoming" to "Past events" on the next daily rebuild. Add a **Recap** so it
  says something useful once it's over.
- **Times are shown in Eastern Time** on the site.
- **Photos:** headshots are cropped to a 4:5 portrait, framed on the upper third. Upload the largest
  version you have; the site resizes and compresses it.

---

## Open items for the board

These came up while rebuilding the site. Placeholders are marked `TODO(board)` in the content files.

1. **Mentor list** (names, firms, photos, LinkedIn) for the home page. Three placeholder mentors are
   saved as drafts in `src/content/mentors/`; replace them and untick **Draft**.
2. **LinkedIn URLs for each board member.** The old site's links didn't match the names, so none
   were carried over. Jessica Lee's appears to be `http://linkedin.com/in/jessica-lee-9413a4247`:
   please verify before adding.
3. **Descriptions for Case Competition, Ambassador Program, Workshops, Panels and Case Buddies.**
   Each has a one-line placeholder to confirm or rewrite.
4. **Upcoming events.** The old "2025 Events" link (`https://forms.gle/1N6v1BwZ12Yxyiit5`) turned
   out to be the *GWC Mentor Application* Google Form (closed as of October 2026), not an event. It's
   saved as a hidden placeholder event; replace it with a real event or delete it. The **Mentorship
   Program** recap's date is unknown, so it's hidden on the site until confirmed.
5. **Newsletter provider** (Mailchimp, Buttondown, Kit/ConvertKit…). Until one is chosen, sign-ups are
   collected by Netlify Forms (Netlify → Forms → newsletter).
6. **Mentor sign-up method.** "Become a mentor" opens an email until a form link is added in
   Site settings → Contact & links. The *GWC Mentor Application* form above could go there when it
   reopens.
7. **Custom domain** (if moving off wixsite.com). Set `SITE_URL` in Netlify afterwards.
8. **Founder card:** Belicia Tan is shown above the board on Meet the Team. Untick **Show as
   founder** (or delete the entry) to remove it.
9. **Student Career Corner link:** this Notion link came from an image on the old site. Confirm it's
   the one to keep.
10. **Board applications** are closed (the *2026–2027 Board Application* form no longer accepts
    responses), so the "Join the board" card says so and points to the newsletter. When applications
    reopen: paste the new form link, tick **Applications open**, and update the deadlines (June 15
    priority / June 30 final on the old site) and **Show deadlines** in Site settings → Contact & links.
11. **Microsoft logo:** the old site's file for it wasn't available, so the official logo from
    Wikimedia Commons is used instead.
12. **Slack invite link.** `girlswhoconsult.slack.com` only shows a sign-in page, so people who aren't
    members yet can't join from it. Create a shareable invite link in Slack (Invite people → Copy
    invite link) and paste it into Site settings → Contact & links → Slack URL.

---

## For developers

### Run it locally

Requires **Node.js 22.22 or newer**.

```bash
npm install
npm run dev
```

Open http://localhost:4321. To use the content manager locally without logging in, run
`npx decap-server` in a second terminal and open http://localhost:4321/admin/index.html.
Locally, saves write straight to the files in `src/content/`; review mode only applies on the live site.

```bash
npm run build     # production build into dist/ (drafts excluded)
npm run preview   # serve the production build
```

### Project layout

```
src/
  content.config.ts   collection schemas (must match public/admin/config.yml)
  content/            all editable content (Markdown + JSON)
  lib/data.ts         data access: validation of site/stats JSON, event sorting, date formatting
  components/         Header, Footer, StatsBand, Mosaic, LogoWall, EventCard, TeamCard…
  pages/              index, about, team, contact, 404, robots.txt
  scripts/            motion.ts (count-up + reveal), forms.ts (Netlify Forms, copy button)
  styles/global.css   Tailwind theme tokens and shared component classes
  assets/             images, optimized at build time by Astro
public/
  admin/              Decap CMS (index.html + config.yml)
  _redirects          old Wix URLs → new pages
```

### Deploying (Netlify)

1. In Netlify, **Add new site → Import from Git** and choose `girlswhoconsult/website`. Build
   settings come from `netlify.toml` (`npm run build`, publish `dist`, Node 22).
2. **Forms:** enable form detection under **Forms**. The `contact` and `newsletter` forms are picked
   up from the built HTML. Add an email notification so new messages reach the board.
3. **Environment variables** (optional, see `.env.example`): `SITE_URL`, `NEWSLETTER_FORM_ACTION`,
   `NEWSLETTER_EMAIL_FIELD`.

### Content manager login (GitHub backend)

Decap uses GitHub to log in and save, with Netlify handling the login handshake:

1. On GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App** (on the
   `girlswhoconsult` account). Homepage URL: your site URL. Authorization callback URL:
   `https://api.netlify.com/auth/done`.
2. In Netlify: **Site configuration → Access & security → OAuth → Install provider → GitHub**, and
   paste the OAuth app's Client ID and Secret.
3. Give each board member write access to the repo on GitHub.

### Daily rebuild

Events are split into Upcoming / Past when the site is built, so the site rebuilds every morning:

1. Netlify: **Site configuration → Build & deploy → Build hooks → Add build hook**, copy the URL.
2. GitHub: **Settings → Secrets and variables → Actions → New repository secret** named
   `NETLIFY_BUILD_HOOK` with that URL.

`.github/workflows/daily-rebuild.yml` calls it at 09:00 UTC. You can also run it by hand from the
repo's **Actions** tab.

### Newsletter provider

`src/components/NewsletterForm.astro` posts to `NEWSLETTER_FORM_ACTION` when it's set:

- **Buttondown:** `https://buttondown.com/api/emails/embed-subscribe/<username>`, field `email`.
- **Mailchimp:** the `action` URL from Audience → Signup forms → Embedded form
  (`https://<dc>.list-manage.com/subscribe/post?u=…&id=…`), field `EMAIL`.
- **Kit (ConvertKit):** the form's `action` URL from its HTML embed, field `email_address`.

Without it, sign-ups go to Netlify Forms (form name `newsletter`).

### Design system

- **Palette** (`src/styles/global.css`): pink-600 `#E95F8C` is the brand pink, for large text,
  shapes and the numbers band. Small pink text and pink buttons use pink-700 `#C2416E` (4.9:1 on
  white). Text is ink `#111111`. Pink-600 and pink-500 fail AA for small text on white, so don't use
  them for it.
- **Type:** Figtree (self-hosted through Astro's font API), 800 weight for headings with tight
  tracking, 400/500 for body.
- **Motion:** only the count-up on the numbers, a short reveal as sections scroll in, the hero shapes
  on load, and hover states. All of it is off when the visitor has reduced motion turned on.
