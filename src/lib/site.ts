import { headers } from "next/headers";
import { SUPABASE_URL } from "@/lib/supabase/config";

export async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "photoscozatti.netlify.app";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export const previewUrl = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/previews/${path}`;

export const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
