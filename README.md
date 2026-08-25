# MarketBoard Templates

Build a SaaS platform called "MarketBoard" — a library of marketing templates/tools for digital marketers and agencies (clinics, real estate, hotels, education, local businesses). UI language: Uzbek (lotin). Modern, premium, dark theme (deep navy #0f1420 background, blue accent #4f8cff, clean cards, rounded corners). Mobile responsive.

STRUCTURE:
1) Landing/home page: hero ("Marketing shablonlari platformasi — bir joyda"), short value text, "Boshlash" button, and a "Shablonlar" gallery section below.
2) Templates gallery: grid of cards. First card is ACTIVE: "RNP Funnel Tracker" (description: "Meta Ads lead funnelini kunlik plan/fakt bo'yicha kuzatish"). Add 4 more cards marked "Tez orada" (disabled/coming soon): "CPL / CPA Kalkulyator", "Budjet Planner", "Haftalik Hisobot", "Kontent Kalendar".
3) Clicking the RNP card opens the RNP Funnel Tracker tool page (route /templates/rnp).

RNP FUNNEL TRACKER TOOL (the core, must fully work):
Top section — Oylik reja (PLAN) inputs: Lead maqsadi (default 800), Q.Lead konversiya % (60), Yozildi konversiya % (63), Keldi konversiya % (50), Yotdi konversiya % (50), Oylik budjet $ (1200), Ish kunlari (27). From these compute the plan funnel: Q.Lead = Lead*QL%, Yozildi = Q.Lead*Zap%, Keldi = Yozildi*Come%, Yotdi = Keldi*Won%. Show these as stat cards.

Month + year selector. Below, a daily editable table for the selected month (one row per day). Each day the user MANUALLY enters 6 values: Budjet $, Fact Lead, Q.Lead Forma, Q.Lead Zvonok, Yozildi, Keldi, Yotdi. The table AUTO-computes (read-only, greyed): 
- daily Lead plan = monthly Lead / working days
- Lead Index % = Fact Lead / daily lead plan
- CPL = Budjet / Fact Lead
- Q.Lead Total = Forma + Zvonok
- Q.Lead Index % = Q.Lead Total / (plan Q.Lead / days)
- CPQL = Budjet / Q.Lead Total
- Lead→Q.Lead % = Q.Lead Total / Fact Lead
Add a bold TOTAL row summing all days with overall CPL, CPQL, indexes, and Lead→Sotuv %.

Visually mark input columns green and auto columns grey, with a small legend ("Qo'lda kiritiladi" vs "Avtomatik").

KPI cards above the table: Sarflangan budjet, Leadlar (fact/plan + index + CPL), Q.Leadlar (index + CPQL), Yotdi/Sotuv (+ CPA), Lead→Sotuv %, Q.Lead→Sotuv %. Color index green/amber/red by performance (>=95% green, 70-94 amber, <70 red).

Two charts (use recharts): (1) Funnel bar chart Reja vs Fakt for the 5 stages; (2) Daily leads bar chart with a dashed line showing daily plan.

For now store all data in the browser (localStorage) per month — no login yet, we'll add Supabase auth next step. Keep the code clean and modular so we can add more templates and authentication later.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/108b249a-d267-45ba-b7af-3162bf3bfac1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
