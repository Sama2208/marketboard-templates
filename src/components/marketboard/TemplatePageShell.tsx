import { ArrowLeft, Loader2, Lock, LogOut } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { BrandMark } from "@/components/marketboard/BrandMark";

export function TemplatePageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { user, session, loading, signOut } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login", replace: true });
  }, [loading, session, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login", replace: true });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <BrandMark className="mb-5" />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Shablonlar
            </Link>
            <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user?.email ? (
              <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>
            ) : null}
            <Link
              to="/templates/rnp"
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
            >
              RNP Tracker
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Chiqish
            </button>
          </div>
        </header>
        {subLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Yuklanmoqda…
          </div>
        ) : !isPro ? (
          <div className="card-surface mx-auto max-w-md py-12 text-center">
            <Lock className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-4 font-display text-lg font-semibold">Bu shablon — Pro rejada</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              "{title}" shabloni Pro obunada ochiladi. RNP Funnel Tracker Free rejada ham to'liq
              ishlaydi.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Link
                to="/"
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
              >
                Tariflar
              </Link>
              <a
                href="https://t.me/samandartargetadmin"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                Pro olish (Telegram)
              </a>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </main>
  );
}
