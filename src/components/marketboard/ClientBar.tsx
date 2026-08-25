import { Plus, Pencil, Trash2, Users } from "lucide-react";
import type { Client } from "@/lib/supabase/clients";

export function ClientBar({
  clients,
  selectedId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  busy,
}: {
  clients: Client[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRename: () => void;
  onDelete: () => void;
  busy?: boolean;
}) {
  return (
    <div className="card-surface flex flex-wrap items-center gap-2 p-3">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Users className="h-4 w-4 text-primary" /> Mijoz
      </span>
      <select
        value={selectedId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        disabled={busy || clients.length === 0}
        className="min-w-[180px] rounded-lg border border-border bg-secondary/60 px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
      >
        {clients.length === 0 ? (
          <option value="">— mijoz yo'q —</option>
        ) : (
          clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))
        )}
      </select>

      <button
        type="button"
        onClick={onAdd}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
      >
        <Plus className="h-4 w-4" /> Yangi mijoz
      </button>

      <button
        type="button"
        onClick={onRename}
        disabled={busy || !selectedId}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground disabled:opacity-50"
      >
        <Pencil className="h-3.5 w-3.5" /> Nomini o'zgartirish
      </button>

      <button
        type="button"
        onClick={onDelete}
        disabled={busy || !selectedId}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-danger/60 hover:text-danger disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" /> O'chirish
      </button>
    </div>
  );
}
