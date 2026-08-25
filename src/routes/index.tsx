import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Layers, Sparkles } from "lucide-react";
import { TemplateGallery } from "@/components/marketboard/TemplateGallery";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MarketBoard — Marketing shablonlari platformasi" },
      {
        name: "description",
        content:
          "MarketBoard — marketologlar va agentliklar uchun tayyor marketing shablonlari: funnel tracker, kalkulyatorlar, hisobotlar.",
      },
      { property: "og:title", content: "MarketBoard — Marketing shablonlari platformasi" },
      {
        property: "og:description",
        content: "Meta Ads funnel, budjet va hisobot shablonlari — bir joyda.",
      },
    ],
  }),
  component: Index,
});

const features = [
  {
    icon: Layers,
    title: "Tayyor shablonlar",
    text: "Klinika, ko'chmas mulk, mehmonxona, ta'lim va lokal biznes uchun vositalar.",
  },
  {
    icon: BarChart3,
    title: "Plan / Fakt nazorati",
    text: "Kunlik ma'lumot kiritasiz — indekslar, CPL va CPQL avtomatik hisoblanadi.",
  },
  {
    icon: Sparkles,
    title: "Toza va tez",
    text: "Ortiqcha sozlash yo'q. Brauzerda ishlaydi, ma'lumot saqlanib qoladi.",
  },
];

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
        <span className="font-display text-lg font-bold tracking-tight">
          Market<span className="text-primary">Board</span>
        </span>
        <a
          href="#shablonlar"
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
        >
          Shablonlar
        </a>
      </header>

      <section className="hero-glow">
        <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-12 text-center sm:pb-24 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs text-muted-foreground">
            Marketologlar va agentliklar uchun
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold leading-tight sm:text-5xl">
            Marketing shablonlari platformasi —{" "}
            <span className="text-gradient">bir joyda</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
            Reklama funnelini kuzatish, budjetni rejalashtirish va mijozga hisobot tayyorlash uchun
            tayyor vositalar to'plami. Excel bilan ovora bo'lmang.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/templates/rnp"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
            >
              Boshlash
            </Link>
            <a
              href="#shablonlar"
              className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Shablonlarni ko'rish
            </a>
          </div>

          <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card-surface p-5">
                <f.icon className="h-5 w-5 text-primary" />
                <h2 className="mt-4 text-sm font-semibold">{f.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TemplateGallery />

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MarketBoard. Barcha huquqlar himoyalangan.
      </footer>
    </main>
  );
}
