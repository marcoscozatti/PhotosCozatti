import { getSession } from "@/lib/supabase/server";
import type { Album, EventItem, Order, Profile, Withdrawal } from "@/lib/types";

// ---------- Dados de exemplo (modo demonstração, sem Supabase) ----------
const hoje = new Date();
const diasAtras = (n: number) => new Date(hoje.getTime() - n * 86_400_000).toISOString();

const DEMO_PROFILE: Profile = {
  id: "demo",
  full_name: "Marcos Cozatti",
  username: "photos.cozatti",
  plan: "free",
  fee_percent: 8,
  fee_customer_share: 0,
};

const DEMO_ALBUMS: Album[] = [
  { id: "a1", title: "Ensaio Adriano Martarelo", city: "Jundiaí - SP", category: "Ensaios", visibility: "unlisted", status: "active", price_per_photo: 15, album_date: "2023-12-08", views: 20, revenue: 0, photos_sold: 0 },
  { id: "a2", title: "Corrida de Rua Jundiaí 10K", city: "Jundiaí - SP", category: "Esportes", visibility: "listed", status: "active", price_per_photo: 12, album_date: diasAtras(3).slice(0, 10), views: 312, revenue: 180, photos_sold: 15 },
];

const DEMO_EVENTS: EventItem[] = [
  { id: "e1", title: "Show Internacional - Heavy Metal", category: "Festas", city: "São Paulo", state: "SP", starts_at: diasAtras(0), cover_url: null, registrations_open: false },
  { id: "e2", title: "Brasileirão 2026 - Santos x Palmeiras", category: "Esportes", city: "Santos", state: "SP", starts_at: diasAtras(-2), cover_url: null, registrations_open: true },
  { id: "e3", title: "Maratona de Jundiaí", category: "Corrida", city: "Jundiaí", state: "SP", starts_at: diasAtras(-10), cover_url: null, registrations_open: true, registered: true },
];

const DEMO_ORDERS: Order[] = [
  { id: "o1", customer_email: "cliente1@email.com", status: "paid", subtotal: 60, photographer_amount: 55.2, paid_at: diasAtras(1), created_at: diasAtras(1) },
  { id: "o2", customer_email: "cliente2@email.com", status: "paid", subtotal: 120, photographer_amount: 110.4, paid_at: diasAtras(3), created_at: diasAtras(3) },
  { id: "o3", customer_email: "cliente3@email.com", status: "pending", subtotal: 36, photographer_amount: 33.12, paid_at: null, created_at: diasAtras(0) },
];

// ---------- Cálculos ----------
export type SerieDia = { dia: string; valor: number };

function serieUltimosDias(orders: Order[], dias: number): SerieDia[] {
  const serie: SerieDia[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoje.getTime() - i * 86_400_000);
    const chave = d.toISOString().slice(0, 10);
    const valor = orders
      .filter((o) => o.status === "paid" && o.paid_at?.slice(0, 10) === chave)
      .reduce((s, o) => s + Number(o.photographer_amount), 0);
    serie.push({ dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), valor });
  }
  return serie;
}

function resumoFinanceiro(orders: Order[], withdrawals: Withdrawal[]) {
  const pagos = orders.filter((o) => o.status === "paid");
  const soma = (lista: Order[]) => lista.reduce((s, o) => s + Number(o.photographer_amount), 0);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).getTime();
  const seteDias = hoje.getTime() - 7 * 86_400_000;

  const totalGanhos = soma(pagos);
  const sacado = withdrawals.filter((w) => w.status !== "rejected").reduce((s, w) => s + Number(w.amount), 0);

  return {
    totalGanhos,
    ganhosMes: soma(pagos.filter((o) => new Date(o.paid_at!).getTime() >= inicioMes)),
    ganhos7Dias: soma(pagos.filter((o) => new Date(o.paid_at!).getTime() >= seteDias)),
    aReceber: soma(orders.filter((o) => o.status === "pending")),
    carrinhos: orders.filter((o) => o.status === "pending").length,
    saldo: Math.max(0, totalGanhos - sacado),
  };
}

// ---------- Consultas ----------
export async function getProfile(): Promise<{ profile: Profile; email: string; demo: boolean }> {
  const s = await getSession();
  if (!s) return { profile: DEMO_PROFILE, email: "demo@photoscozatti.com.br", demo: true };
  const { data } = await s.supabase.from("profiles").select("*").eq("id", s.user.id).single();
  return {
    profile: (data as Profile) ?? { ...DEMO_PROFILE, id: s.user.id, full_name: s.user.email ?? "" },
    email: s.user.email ?? "",
    demo: false,
  };
}

async function getOrdersAndWithdrawals() {
  const s = await getSession();
  if (!s) return { orders: DEMO_ORDERS, withdrawals: [] as Withdrawal[] };
  const [{ data: orders }, { data: withdrawals }] = await Promise.all([
    s.supabase.from("orders").select("*").order("created_at", { ascending: false }),
    s.supabase.from("withdrawals").select("*").order("created_at", { ascending: false }),
  ]);
  return { orders: (orders ?? []) as Order[], withdrawals: (withdrawals ?? []) as Withdrawal[] };
}

export async function getDashboard() {
  const [{ orders, withdrawals }, albums, events] = await Promise.all([
    getOrdersAndWithdrawals(),
    getAlbums(),
    getEvents("disponiveis"),
  ]);
  return {
    ...resumoFinanceiro(orders, withdrawals),
    visitas: albums.reduce((s, a) => s + a.views, 0),
    serie: serieUltimosDias(orders, 7),
    ultimasVendas: orders.filter((o) => o.status === "paid").slice(0, 5),
    eventos: events.slice(0, 3),
  };
}

export async function getFinance() {
  const { orders, withdrawals } = await getOrdersAndWithdrawals();
  return {
    ...resumoFinanceiro(orders, withdrawals),
    serie: serieUltimosDias(orders, 30),
    vendas: orders,
    saques: withdrawals,
  };
}

export async function getAlbums(): Promise<Album[]> {
  const s = await getSession();
  if (!s) return DEMO_ALBUMS;
  const { data } = await s.supabase
    .from("albums")
    .select("*, orders(photographer_amount, status, order_items(photo_id))")
    .order("album_date", { ascending: false });

  type Row = Album & { orders: { photographer_amount: number; status: string; order_items: unknown[] }[] };
  return ((data ?? []) as Row[]).map(({ orders, ...album }) => {
    const pagos = (orders ?? []).filter((o) => o.status === "paid");
    return {
      ...album,
      revenue: pagos.reduce((s, o) => s + Number(o.photographer_amount), 0),
      photos_sold: pagos.reduce((s, o) => s + (o.order_items?.length ?? 0), 0),
    };
  });
}

export type AbaEventos = "disponiveis" | "inscritos" | "meus";

export async function getEvents(aba: AbaEventos): Promise<EventItem[]> {
  const s = await getSession();
  if (!s) {
    if (aba === "inscritos") return DEMO_EVENTS.filter((e) => e.registered);
    if (aba === "meus") return [];
    return DEMO_EVENTS;
  }
  const [{ data: events }, { data: regs }] = await Promise.all([
    s.supabase.from("events").select("*").order("starts_at", { ascending: true }),
    s.supabase.from("event_registrations").select("event_id").eq("photographer_id", s.user.id),
  ]);
  const inscritos = new Set((regs ?? []).map((r) => r.event_id as string));
  const lista = ((events ?? []) as (EventItem & { created_by: string })[]).map((e) => ({
    ...e,
    registered: inscritos.has(e.id),
    mine: e.created_by === s.user.id,
  }));
  if (aba === "inscritos") return lista.filter((e) => e.registered);
  if (aba === "meus") return lista.filter((e) => e.mine);
  return lista;
}
