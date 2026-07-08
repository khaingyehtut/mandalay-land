# Build Prompt — "Mandalay Land" Flutter App

> Hand this whole document to an AI coding assistant (Claude Code, Cursor, etc.) or a
> Flutter developer. It is a complete spec to rebuild the existing Next.js website as a
> native mobile app that talks to the **existing** backend REST API.

---

## 1. Role & goal

You are building a **Flutter mobile app (Android + iOS)** called **Mandalay Land** — a
Burmese-language (မြန်မာ) real-estate / land-plot marketplace for Mandalay, Myanmar.

This is **not** a greenfield product. A production Next.js website already exists at
`https://mandalayland.com` with a MongoDB database, image uploads, Viber channel
auto-posting, and a REST API. **The Flutter app is a new client for that same API.** Do
not rebuild the backend. Reuse every endpoint below as-is (plus a few small additions
noted in §4.4 that the backend team must add for mobile auth).

Target **feature parity** with the website: public browsing, agent posting dashboard, and
an admin panel.

---

## 2. What the app is (product summary)

A mobile-first marketplace where:

- **Buyers** (no login) browse land plots, filter by township, search, view a photo
  gallery + full spec sheet, and tap to **call** or open **Viber** with an agent.
- **Agents** (logged in) post their own listings — add / edit / delete plots with up to 6
  photos, sale or rent type, status (available / sold / pending). Every new listing is
  auto-posted to a Viber channel by the backend.
- **Admin** (one specific email) manages all plots and users, sees analytics, and edits
  the public "contact" agent cards.

The whole UI is in **Burmese**. Numbers shown to users are rendered in **Myanmar
numerals** (၀၁၂၃၄၅၆၇၈၉). Prices are in **သိန်း** (lakh). Areas in **စတုရန်းပေ** (sq ft).

---

## 3. Look & feel (design system)

Dark theme, gold accent, rounded cards, spring-animated bottom sheets. Match these exactly.

**Colors**
| Token | Hex | Use |
|---|---|---|
| Background | `#0C0D11` | app / admin background |
| Surface | `#13151A` | cards, sheets |
| Surface-2 | `#191C25` | inputs, inner tiles |
| Border | `#1E2232` | hairline borders |
| Border-2 | `#2C313C` | input borders |
| Accent (gold) | `#E0A33B` → `#F4B942` | primary buttons (gradient), highlights |
| Accent ink | `#1A1206` | text on gold buttons |
| Text | `#ECE6D9` | primary text |
| Muted | `#6B7280` | secondary text |
| Faint | `#374151` / `#555A66` | tertiary |
| Success | `#34d399` (bg `rgba(16,185,129,.12)`) | "available" status |
| Danger | `#f87171` (bg `rgba(239,68,68,.12)`) | "sold", delete |
| Warning | `#fbbf24` (bg `rgba(245,158,11,.12)`) | "pending" |
| Viber purple | `#9B8FE0` / `#665CAC` | Viber buttons/cards |

**Typography** — bundle a Burmese-capable font (e.g. **Padauk** or **Pyidaungsu**, or
`google_fonts` Padauk) and use it everywhere. Numerals in UI text are converted to Myanmar
digits (see §6).

**Motion** — bottom sheets slide up with an overshoot spring
(`cubic-bezier(0.34,1.56,0.64,1)`, ~420ms). Cards fade/slide in with small staggered delays.
Photo galleries auto-advance every ~3s and support swipe + dot indicators.

**Layout** — mobile widths (~400–440px content max). Bottom navigation bar. Detail views
and forms open as **draggable bottom sheets**, not full pages, where the web app does.

---

## 4. Backend API contract (reuse as-is)

Base URL: `https://mandalayland.com` (make it a configurable constant / `--dart-define`).

**IMPORTANT — image URLs are relative.** The API returns image paths like
`/uploads/1720000000-ab12.jpg`. The Flutter app **must prefix them with the base URL**
before loading: `https://mandalayland.com/uploads/…`. (Never assume absolute URLs.)

### 4.1 Plots

- `GET /api/plots` — **public**. Returns `Plot[]`, newest first. `images` is a JSON array of
  relative paths.
- `GET /api/plots/mine` — **auth**. The current user's plots.
- `GET /api/plots/{id}` — single plot.
- `POST /api/plots` — **auth**. Create. Body = plot fields (see §5). Server also fires the
  Viber auto-post. Returns the created plot (201).
- `PUT /api/plots/{id}` — **auth, owner only**. Update. Partial body allowed. Changing
  `status` to `sold`/`pending` triggers a Viber status update.
- `DELETE /api/plots/{id}` — **auth, owner only**.

### 4.2 Uploads

- `POST /api/upload` — **auth**. `multipart/form-data` with field `file`. Accepts
  `image/jpeg|png|webp|gif`. Returns `{ "url": "/uploads/<name>" }`. Upload each image
  separately; the client collects the returned URLs into the plot's `images` array. Max **6**
  images per plot; **first image is the primary/cover**.

### 4.3 Agents & settings (public read, admin write)

- `GET /api/agents` — **public**. Returns `Agent[]` = `{ id, name, title, phone, photo }`.
  `photo` is a relative upload path. These power the Contact screen.
- `POST` / `PUT` / `DELETE /api/agents` — **admin only** (identified by `ADMIN_EMAIL`).
- `GET /api/settings` — **public**. Site defaults: `phone`, `phone2`, `agentName`,
  `agentTitle`, `agentPhoto`, etc. Use `phone` as the fallback "call" number.
- `PUT /api/settings` — **admin only**.

### 4.4 Auth — ⚠️ needs small backend additions for mobile

The web app uses **NextAuth** with three providers — **Google**, **Facebook**, and
**Credentials (email + password, bcrypt)** — and a **cookie/JWT session**. Registration and
all admin mutations are currently **Next.js server actions**, not REST endpoints. Cookie
sessions and server actions don't work cleanly from a native mobile client, so the backend
team must expose these thin REST endpoints (tell them; they mirror existing logic):

1. `POST /api/mobile/login` → `{ email, password }` → returns a **signed JWT** (reuse
   `NEXTAUTH_SECRET`) + user object. Mobile sends `Authorization: Bearer <jwt>` on all
   authed calls; the API routes accept either the NextAuth cookie **or** this bearer token.
2. `POST /api/mobile/register` → wraps the existing `registerUser` action
   (`lib/actions/auth.js`): name (≥2), email, password (≥6), phone (required), bcrypt hash.
3. `POST /api/auth/forgot-password` and `/api/auth/reset-password` already exist as routes —
   reuse them.
4. `POST /api/user/change-password` already exists — reuse.
5. Admin ops (`adminDeletePlot`, `adminUpdatePlotStatus`, `adminDeleteUser` in
   `lib/actions/admin.js`) need REST equivalents, e.g. `POST /api/admin/...`, all gated on
   `email === ADMIN_EMAIL`.
6. For **Google/Facebook** on mobile, use native SDKs (`google_sign_in`,
   `flutter_facebook_auth`) to get an ID token, then add `POST /api/mobile/oauth` that
   verifies it, upserts the user (mirrors the NextAuth `signIn` callback), and returns a JWT.

Store the JWT in `flutter_secure_storage`. Admin status = `user.email == ADMIN_EMAIL`
(the app can treat "is this the admin email" as the gate; keep the real enforcement server-side).

> If the backend additions are out of scope for now, build the client against a mock/stub
> auth service with the same shapes so screens are complete, and leave clear TODOs.

Also ensure the API sends permissive **CORS**/accepts the bearer token for the app origin.

---

## 5. Data models (port to Dart classes)

```
Plot {
  String  id
  String  userId
  String  township        // required, from TOWNSHIPS list
  String? street          // "လမ်း / ရပ်ကွက်"
  int     width           // ပေ (feet)
  int     height          // ပေ
  String  grant           // from GRANTS list; "—" for rentals
  int     priceLakh       // sale: သိန်း (lakh); rent: kyat per month
  String? facing          // from FACINGS: အရှေ့ / အနောက် / တောင် / မြောက်
  String? road            // "ရှေ့လမ်း"
  String? tag             // short badge label
  String  listingType     // "sale" | "rent"   (default "sale")
  String  status          // "available" | "sold" | "pending"
  String? note            // free text ("မှတ်ချက်")
  List<String> images     // relative /uploads paths, max 6, [0] = cover
  String? agentName
  String? agentPhone
  DateTime createdAt
}

Agent   { String id; String name; String? title; String? phone; String? photo; }
UserRef { String id; String? name; String email; String? image; String? phone; DateTime createdAt; int plotCount; }
```

**Fixed option lists** (copy verbatim — Burmese):

```
TOWNSHIPS = ["ချမ်းမြသာစည်","ပြည်ကြီးတံခွန်","အောင်မြေသာစံ","မဟာအောင်မြေ","ချမ်းအေးသာစံ",
             "အမရပူရ","ပုသိမ်ကြီး","မတ္တရာ","ဥပ္ပါတ်","ကြံခင်းကုန်း","ကျောက်ဆည်","မြင်းမူ"]
GRANTS    = ["ဂရန်မြေ","ပါမစ်မြေ","ဘိုးဘွားပိုင်","မြေပုံကျ","လယ်ယာမြေ"]
FACINGS   = ["အရှေ့","အနောက်","တောင်","မြောက်"]
```

**Status labels** (differ by listing type):

- sale: available=`ရောင်းရန်ရှိ`, sold=`ရောင်းပြီး`, pending=`ဆိုင်းငံ့`
- rent: available=`ငှားရန်ရှိ`, sold=`ငှားပြီး`, pending=`ဆိုင်းငံ့`

---

## 6. Formatting & business rules (must port exactly)

**Myanmar numerals** — everywhere a count/size/price is shown to the user, convert ASCII
digits to `၀၁၂၃၄၅၆၇၈၉`. Port `lib/format.js`:

```dart
const _mm = '၀၁၂၃၄၅၆၇၈၉';
String mmNum(Object? n) => n.toString()
    .replaceAllMapped(RegExp(r'\d'), (m) => _mm[int.parse(m[0]!)]); // 0-9 → ၀-၉
String mmPrice(int lakh) => '${mmNum(lakh)} သိန်း';
```

Price display: sale → `<mmNum> သိန်း`; rent → `<price kyat, grouped> ကျပ် /1လ`.
Area → `mmNum(width*height) စတုရန်းပေ`. Card meta → `width×height ပေ`.

**Phone-number blocking (critical)** — agents must **not** hide phone numbers inside the
`street`, `road`, `tag`, or `note` text fields (those are public and un-moderated). The web
app has a robust detector in **`lib/phoneDetect.ts`** that blocks Myanmar phone numbers in
every evasion form: standard `09…`, dotted/spaced/slashed, **Myanmar Unicode digits**,
**spelled-out Burmese number words** (သုည/တစ်/နှစ်…), Latin letter substitutions
(o9/O9), `+95`/`959` international, Arabic-Indic digits, and mixed scripts — while **not**
false-positiving on dimensions (`40x60`), prices (`950 သိန်း`), or dates. **Port this whole
file to Dart** and run it on those four fields, both live (red field border + inline error
`ဖုန်းနံပါတ် ထည့်၍ မရပါ`) and on save (block submit). Do not weaken it.

**Contact deep links**

- Call: `tel:<digits only>`.
- Viber chat: `viber://chat?number=%2B95<phone without leading 0, digits only>`.
- Viber channel: open `NEXT_PUBLIC_VIBER_CHANNEL` invite URL in browser.

---

## 7. Screens & navigation

Bottom nav with the main destinations. Build these screens:

### 7.1 Home / Listings (public) — `GET /api/plots`

- Header: brand ("Mandalay Land" + Burmese subtitle "ကိုအောင် အိမ်ခြံမြေ နှင့် ဆောက်လုပ်ရေး"),
  a "မန္တလေး" location chip.
- A **Buy / Sell** segmented toggle: `ဝယ်မယ်` / `ရောင်းမယ်`.
- **Buy mode**: a search field (`မြို့နယ် / လမ်း ရှာရန်...`) filtering by township+street+grant;
  a horizontal **township chip row** (first chip `အားလုံး` = all); a count line
  (`<mmNum> ကွက်`); then a vertical list of **plot cards**:
  - Cover = auto-sliding image carousel (swipe + dots) or a drawn plot-plan placeholder if
    no images; a `tag` badge; a red `ရောင်းပြီး` overlay when sold.
  - Info: township + (street · grant), price (`<mmNum>` big + `သိန်း`), meta row
    (`width×height ပေ`, facing, road), and a gold **`ဖုန်းခေါ်မယ်`** call button (uses site phone).
  - Tapping a card opens the **Plot detail bottom sheet** (§7.2).
  - Empty state: `မြေကွက် မရှိသေးပါ။ တခြားမြို့နယ် ရွေးကြည့်ပါ။`
- **Sell mode**: a static "want to sell your land?" panel — 3 numbered steps (call → describe
  → we connect you to a buyer) and a call CTA `မြေကွက်တင်ရန် ဖုန်းခေါ်မယ်`. (Copy the Burmese
  body text from `components/Listings.jsx` sell section.)

### 7.2 Plot detail (bottom sheet)

Full-width photo gallery (swipe + dots + auto-slide) or plot-plan placeholder; title
`<township> မြေကွက်`; subtitle (street · grant); big price (sale `သိန်း` / rent `ကျပ် /1လ`);
a **specs grid**: အကျယ်အဝန်း (`w × h ပေ`), ဧရိယာ (`mmNum(w*h) စတုရန်းပေ`), ဂရန်အမျိုးအစား,
မျက်နှာလည့် (`<facing>ဘက်`), ရှေ့လမ်း, တည်နေရာ; optional note; a primary
**`ဖုန်းတိုက်ရိုက်ခေါ်မယ်`** call button + a `ပိတ်မယ်` close; footer `ကြိုက်ရင် ဖုန်းတစ်ချက်ခေါ်ရုံ — <phone>`.

### 7.3 Contact / Phone (public) — `GET /api/agents`

- Title `ဆက်သွယ်ရန်`. For each agent: a premium card with avatar (photo or initial),
  name, title, phone (big), and two buttons: gold **`ဖုန်းခေါ်မည်`** (tel:) and a **Viber**
  button (viber:// deep link).
- A **Viber Channel** join card (opens the channel invite URL).
- **If admin**: an "အဖွဲ့ဝင် ကတ်များ" management section — list agents with edit/delete, and a
  `ကတ်အသစ် ထည့်မည်` button that opens an **agent add/edit bottom sheet** (photo upload via
  `/api/upload`, name\*, title, phone) → `POST`/`PUT`/`DELETE /api/agents`.

### 7.4 Auth

- **Login** — email + password → mobile login endpoint; plus **Google** & **Facebook**
  buttons (native SDK → oauth endpoint). Burmese labels, gold primary button.
- **Register** — name, email, password (≥6), **phone (required)** → register endpoint.
  Validation messages in Burmese (copy from `lib/actions/auth.js`).
- **Forgot password** — email → `/api/auth/forgot-password` (sends reset email via backend).
- **Reset password** — token + new password → `/api/auth/reset-password`.

### 7.5 Agent dashboard (auth) — `GET /api/plots/mine`

- Header with brand + a gold **`တင်မည်`** (add) button and count `<mmNum> ကွက် တင်ထားသည်`.
- A Viber-channel join banner (`Viber Channel ဝင်ပါ` — "every listing auto-posts to the channel").
- List of the agent's own plot cards (thumbnail + township + status badge + street +
  `w×h ပေ · grant` + `<mmNum> သိန်း` + posted date/time), each with **`ပြင်မည်`** (edit) and
  **`ဖျက်မည်`** (delete, with confirm) actions.
- Empty state: `မြေကွက် မတင်ရသေးပါ` + `ပထမဆုံး မြေကွက် တင်မည်` button.
- **Add / Edit bottom sheet** (`မြေကွက်အသစ် တင်ရန်` / `မြေကွက် ပြင်ဆင်ရန်`) — the core form:
  - Sale/Rent toggle (`ရောင်းမည်` / `အဌားမည်`). Rent hides the grant field and relabels price
    to `ငှားဈေး (ကျပ်/လ)` and status labels to ငှား….
  - Fields: မြို့နယ်* (dropdown from TOWNSHIPS), လမ်း/ရပ်ကွက် (phone-checked), အကျယ်(ပေ)*,
    အလျား(ပေ)_, ဂရန်အမျိုးအစား (dropdown), ဈေး(သိန်း)_, မျက်နှာလည့် (dropdown), အမှတ်အသား tag
    (phone-checked), အခြေအနေ status (dropdown), မှတ်ချက် note (phone-checked), အကျိုးဆောင်
    နာမည်, အကျိုးဆောင် ဖုန်း.
  - **Images**: grid up to 6, tap tile → pick from gallery/camera → `POST /api/upload` per
    file → append returned URL; first is badged `ပင်မ`; each removable. Show an uploading spinner.
  - Live **phone-number validation** on the 4 text fields (red border + error). Block save if
    any field contains a phone number (`ဖုန်းနံပါတ် ပါဝင်သော ကွက်လပ်ရှိသည် — ဖျက်ပြီးမှ သိမ်းပါ`).
  - Save → `POST /api/plots` (create) or `PUT /api/plots/{id}` (edit). Button text
    `မြေကွက် တင်မည်` / `ပြင်ဆင်ချက် သိမ်းမည်`, busy state `သိမ်းနေသည်...`.

### 7.6 Admin dashboard (admin only)

Three tabs — `ခြုံငုံသုံးသပ်` / `မြေကွက်များ` / `အသုံးပြုသူများ`:

- **Overview**: stat cards (total plots, available, sold, total users, total value in
  `သိန်း`), a per-township horizontal bar chart (count + total value), and a "recent plots"
  list. (Backend should expose an admin stats endpoint, or compute client-side from
  `/api/plots` + a users list endpoint.)
- **Plots**: search + status filter + township filter; each row = thumb, township·street,
  status badge, `w×h ပေ · grant · price သိန်း`, owner name; inline **status change** dropdown
  and **delete** (confirm) → admin endpoints.
- **Users**: search; each row = avatar, name, provider badge (Google / Facebook / အီးမေးလ်),
  email·phone, plot count. Tapping opens a **user detail sheet** (avatar, email, phone,
  join date, plot count, user id, their plots, and a **delete-user** button that cascades
  their plots — hidden for the admin's own account).

### 7.7 Profile / user (auth)

User profile screen with account info, a **change password** action
(`POST /api/user/change-password`), and **sign out** (clear stored JWT).

---

## 8. Suggested Flutter stack

- **State**: Riverpod (or Bloc/Provider) — pick one and keep it consistent.
- **HTTP**: `dio` (interceptor injects the bearer token; prefixes relative image URLs).
- **Routing**: `go_router` with a bottom-nav shell; sheets via `showModalBottomSheet`
  (`isScrollControlled: true`, custom spring transition).
- **Auth**: `flutter_secure_storage` (JWT), `google_sign_in`, `flutter_facebook_auth`.
- **Media**: `image_picker` (gallery + camera), `cached_network_image`, a carousel
  (`carousel_slider` or `PageView` + auto-timer + dots).
- **Links**: `url_launcher` for `tel:` and `viber://`.
- **Font**: bundle Padauk/Pyidaungsu (or `google_fonts`), set as the default text theme.
- Centralize the color tokens (§3), `mmNum`/`mmPrice`, the ported `phoneDetect`, the fixed
  option lists, and status-label maps in a shared `core/` layer.

---

## 9. Deliverables & milestones

1. **Scaffold** — Flutter project, theme (colors + Burmese font), core utils (`mmNum`,
   status labels, option lists), `phoneDetect.dart` port + unit tests, Dio client with base
   URL + image-URL prefixing.
2. **Public app** — Listings (buy/sell, search, chips, cards, carousel), Plot detail sheet,
   Contact screen with call/Viber deep links. (Works with no login.)
3. **Auth** — login / register / forgot / reset, JWT storage, Google & Facebook. (Coordinate
   the backend additions in §4.4.)
4. **Agent dashboard** — my listings, add/edit sheet with image upload + phone validation,
   delete.
5. **Admin** — overview/plots/users tabs, filters, status change, deletes, user detail sheet.
6. **Polish** — animations, empty/loading/error states, offline handling, app icon,
   splash, Android/iOS build configs.

## 10. Constraints & gotchas (read before coding)

- **Always prefix `/uploads/...` image paths with the API base URL.** This bit the web app
  before — relative/localhost URLs break image loading.
- Keep **all user-facing strings in Burmese**; reuse the exact strings from the web source
  where quoted here.
- Numbers shown to users go through `mmNum`; keep raw ints for logic/sorting.
- The **phone-number blocker must not be weakened** — it's a core moderation rule.
- Enforce **max 6 images**, first = cover.
- Admin is a single email (`ADMIN_EMAIL`); never trust the client — the server enforces it.
- Rent vs sale changes labels, hides grant, and changes the price unit/format — handle both.

---

### Reference source files (in the existing Next.js repo)

`prisma/schema.prisma` (models) · `components/Listings.jsx` + `components/PlotSheet.jsx`
(public UI) · `app/admin/page.js` (agent add/edit form) · `app/dashboard/DashboardClient.jsx`
(admin panel) · `app/phone/PhonePageClient.jsx` (contact + agent mgmt) ·
`lib/format.js` (numerals) · `lib/phoneDetect.ts` (phone blocker — **port fully**) ·
`lib/auth.js` (providers) · `lib/actions/auth.js` + `lib/actions/admin.js` (server actions to
expose as REST) · `app/api/**` (existing endpoints).
