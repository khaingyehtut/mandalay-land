# မန္တလေး မြေကွက် — Next.js Full-Stack App

မန္တလေးမြို့ မြေကွက် အရောင်းအဝယ် website/app။ Frontend + Backend + Database အပြည့်အစုံ။
ဝယ်သူက မြေကွက်ကို ကြိုက်ရင် **ဖုန်းတိုက်ရိုက်ခေါ်** (tap-to-call) နိုင်သည်။ ပိုင်ရှင်က **/admin** ကနေ မြေကွက်တွေ ကိုယ်တိုင် တင်/ပြင်/ဖျက်နိုင်သည်။

## ပါဝင်သည့် နည်းပညာ

- **Next.js 14** (App Router) — frontend + API
- **Prisma + SQLite** — database (production အတွက် Postgres ပြောင်းနိုင်)
- မြန်မာစာ UI (Noto Sans Myanmar / Padauk)
- မြေတိုင်းပုံ (cadastral site-plan) ဒီဇိုင်း signature

## စတင်အသုံးပြုနည်း (Local)

```bash
# 1) packages သွင်းပါ
npm install

# 2) .env ဖိုင် ပြင်ဆင်ပါ
cp .env.example .env
#   .env ထဲမှာ ADMIN_KEY နဲ့ NEXT_PUBLIC_PHONE ကို သင့်ဟာနဲ့ ပြောင်းပါ

# 3) database ဆောက်ပါ
npx prisma migrate dev --name init

# 4) (optional) နမူနာ မြေကွက် ၈ ကွက် ထည့်ပါ
npm run seed

# 5) run
npm run dev
```

ပြီးရင် browser မှာ **http://localhost:3000** ဖွင့်ပါ။
Admin စာမျက်နှာ — **http://localhost:3000/admin** (ADMIN_KEY ဖြင့် ဝင်)။

## .env တန်ဖိုးများ

| key                 | အဓိပ္ပာယ်                                                  |
| ------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`      | database လမ်းကြောင်း (local: `file:./dev.db`)              |
| `ADMIN_KEY`         | /admin ဝင်ဖို့ နဲ့ မြေကွက်တင်/ပြင်/ဖျက်ဖို့ လျှို့ဝှက်ကုဒ် |
| `NEXT_PUBLIC_PHONE` | ဆက်သွယ်ရန် ဖုန်းနံပါတ် (ဥပမာ — `09766708390`)              |

## Online တင်နည်း (Vercel — အခမဲ့)

SQLite သည် Vercel serverless မှာ အမြဲ မသိမ်းနိုင်သဖြင့် **Postgres** ပြောင်းရန် လိုသည် (Neon.tech / Supabase အခမဲ့ရနိုင်)။

1. `prisma/schema.prisma` ထဲ —
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Neon/Supabase မှ Postgres connection string ကို Vercel ရဲ့ Environment Variables မှာ `DATABASE_URL` အဖြစ် ထည့်ပါ။ `ADMIN_KEY`, `NEXT_PUBLIC_PHONE` လည်း ထည့်ပါ။
3. GitHub သို့ push → Vercel မှာ import → Deploy။
4. တစ်ကြိမ် `npx prisma migrate deploy` (Vercel build command ထဲ ထည့်ထားပြီး — `package.json` build script မှာ `prisma generate` ပါပြီးသား; migration အတွက် Vercel Postgres docs ကြည့်ပါ)။

ပြီးရင် link ကို Facebook Page မှာ share လိုက်ရုံပါပဲ။

## ဖိုင်ဖွဲ့စည်းပုံ

```
app/
  page.js              ← ပင်မ (မြေကွက်စာရင်း)
  admin/page.js        ← စီမံခန့်ခွဲမှု (passcode)
  api/plots/route.js   ← list + create
  api/plots/[id]/route.js ← get + update + delete
  layout.js  globals.css
components/
  Listings.jsx         ← UI + ရှာဖွေ/စစ်ထုတ်/ဖုန်းခေါ်
  PlotPlan.jsx         ← မြေတိုင်းပုံ SVG
lib/  db.js  format.js
prisma/  schema.prisma  seed.js
```

## မှတ်ချက်

- Admin auth သည် ရိုးရှင်းသော passcode သာ ဖြစ်သည်။ လုပ်ငန်းကြီးထွားလာရင် login/account စနစ် ထပ်တိုးနိုင်သည်။
- ဓာတ်ပုံ၊ Google Map link၊ Viber/Messenger ခလုတ် စသဖြင့် ထပ်ဖြည့်လိုပါက Plot model နဲ့ UI မှာ field ထပ်ထည့်ရုံပါပဲ။
