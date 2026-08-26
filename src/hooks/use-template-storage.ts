import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/**
 * Step 8 MVP shablonlari uchun foydalanuvchiga ajratilgan browser storage.
 * RNP ma'lumotlari bu hook orqali saqlanmaydi — ular Supabase'da qoladi.
 */
export function useTemplateStorage<T>(
  namespace: string,
  userId: string | undefined,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = userId ? `marketboard:template:${namespace}:${userId}` : null;
  const [value, setValue] = useState<T>(initialValue);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") {
      setHydratedKey(null);
      setValue(initialValue);
      return;
    }

    try {
      const raw = window.localStorage.getItem(storageKey);
      setValue(raw ? (JSON.parse(raw) as T) : initialValue);
    } catch {
      setValue(initialValue);
    }
    setHydratedKey(storageKey);
  }, [storageKey, initialValue]);

  useEffect(() => {
    if (!storageKey || hydratedKey !== storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Storage to'lib qolsa, shablon joriy sessiyada baribir ishlashda davom etadi.
    }
  }, [hydratedKey, storageKey, value]);

  return [value, setValue];
}
