import { supabase } from "./client";

/** Mijoz (agentlik uchun ko'p mijoz — har biri alohida funnel). */
export type Client = { id: string; name: string; created_at: string };

export async function listClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("id,name,created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Client[];
}

export async function addClient(name: string): Promise<Client> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Avtorizatsiya yo'q");
  const { data, error } = await supabase
    .from("clients")
    .insert({ name: name.trim() || "Yangi mijoz", user_id: userId })
    .select("id,name,created_at")
    .single();
  if (error) throw error;
  return data as Client;
}

export async function renameClient(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from("clients")
    .update({ name: name.trim() || "Nomsiz mijoz" })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
}
