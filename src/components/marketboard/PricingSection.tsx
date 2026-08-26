import { Check, Sparkles } from "lucide-react";
import { planCatalog } from "@/lib/subscription";

export function PricingSection() {
  return (
    <section id="tariflar" className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Tariflar
        </span>
        <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
          O'zingizga mos rejani tanlang
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Free rejada boshlang. Pro rejada agentlik ishlarini bir joyda boshqaring.
        </p>
      </div>
      <div className="mx-auto mt-9 grid max-w-3xl gap-4 md:grid-cols-2">
        {planCatalog.map((plan) => (
          <article
            key={plan.id}
            className={`card-surface relative p-6 ${plan.featured ? "border-primary/70 shadow-elegant" : ""}`}
          >
            {plan.featured ? (
              <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold text-primary">
                <Sparkles className="h-3 w-3" /> Tavsiya qilinadi
              </span>
            ) : null}
            <p className="text-sm font-semibold text-muted-foreground">{plan.name}</p>
            <p className="mt-2 font-display text-3xl font-bold">{plan.price}</p>
            <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" /> {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled
              className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold ${
                plan.featured
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {plan.featured ? "Tez orada ulanish" : "Hozir foydalanish mumkin"}
            </button>
          </article>
        ))}
      </div>
      <p className="mt-5 text-center text-xs text-muted-foreground">
        To'lov provayderi tanlangach Payme, Click yoki Stripe ulanishi faollashtiriladi.
      </p>
    </section>
  );
}
