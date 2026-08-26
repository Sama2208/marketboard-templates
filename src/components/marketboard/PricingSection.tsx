import { Check, MessageCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { planCatalog } from "@/lib/subscription";

const telegramAdmin = "samandartargetadmin";

export function PricingSection() {
  const { user } = useAuth();
  const { isPro, loading: subscriptionLoading } = useSubscription();

  const telegramMessage = [
    "Assalomu alaykum! MarketBoard Pro obunasini sotib olmoqchiman.",
    "",
    "Tarif: Pro — $9 / oy",
    `Email: ${user?.email ?? "ko'rsatilmagan"}`,
    `Foydalanuvchi ID: ${user?.id ?? "ko'rsatilmagan"}`,
    "",
    "To'lov rekvizitlarini yuboring.",
  ].join("\n");

  const telegramUrl = `https://t.me/${telegramAdmin}?text=${encodeURIComponent(telegramMessage)}`;

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
            {plan.featured ? (
              isPro ? (
                <span className="mt-6 flex w-full items-center justify-center rounded-lg bg-success/15 px-4 py-2.5 text-sm font-semibold text-success">
                  Pro obuna faol
                </span>
              ) : user ? (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] ${
                    subscriptionLoading ? "pointer-events-none opacity-70" : ""
                  }`}
                >
                  <MessageCircle className="h-4 w-4" /> Telegram orqali sotib olish
                </a>
              ) : (
                <a
                  href="/login"
                  className="mt-6 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  Sotib olish uchun kiring
                </a>
              )
            ) : (
              <span className="mt-6 flex w-full items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground">
                Hozir foydalanish mumkin
              </span>
            )}
          </article>
        ))}
      </div>
      <p className="mx-auto mt-5 max-w-xl text-center text-xs leading-relaxed text-muted-foreground">
        Pro uchun admin Telegram'da to'lov rekvizitlarini yuboradi. To'lov cheki tekshirilgach obuna
        qo'lda faollashtiriladi.
      </p>
    </section>
  );
}
