import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { templates } from "@/data/templates";

function CardBody({ item }: { item: (typeof templates)[number] }) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
          {item.tag}
        </span>
        {item.active ? (
          <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
            Faol
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> Tez orada
          </span>
        )}
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold">{item.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
        {item.active ? (
          <>
            Ochish <ArrowRight className="h-4 w-4" />
          </>
        ) : (
          <span className="text-muted-foreground">Ishlab chiqilmoqda</span>
        )}
      </div>
    </>
  );
}

export function TemplateGallery() {
  return (
    <section id="shablonlar" className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-24">
      <div className="max-w-2xl">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Shablonlar</h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Marketologlar va agentliklar uchun tayyor vositalar. Har biri real ishda sinovdan o'tgan
          jarayonlar asosida qurilgan.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((item) =>
          item.active && item.to ? (
            <Link
              key={item.slug}
              to={item.to}
              className="card-surface group p-6 transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-elegant"
            >
              <CardBody item={item} />
            </Link>
          ) : (
            <div
              key={item.slug}
              aria-disabled="true"
              className="card-surface cursor-not-allowed p-6 opacity-60"
            >
              <CardBody item={item} />
            </div>
          ),
        )}
      </div>
    </section>
  );
}
