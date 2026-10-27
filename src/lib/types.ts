export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  plan: "free" | "pro";
  fee_percent: number;
  fee_customer_share: number;
  whatsapp?: string | null;
  instagram?: string | null;
  city?: string | null;
};

export type Album = {
  id: string;
  title: string;
  city: string | null;
  category: string;
  visibility: "listed" | "unlisted" | "portfolio";
  status: "active" | "draft" | "archived";
  price_per_photo: number;
  album_date: string;
  views: number;
  revenue?: number;
  photos_sold?: number;
};

export type EventItem = {
  id: string;
  title: string;
  category: string;
  city: string | null;
  state: string | null;
  starts_at: string;
  cover_url: string | null;
  registrations_open: boolean;
  registered?: boolean;
  mine?: boolean;
};

export type Order = {
  id: string;
  customer_email: string;
  status: string;
  subtotal: number;
  photographer_amount: number;
  paid_at: string | null;
  created_at: string;
};

export type Withdrawal = {
  id: string;
  amount: number;
  pix_key: string;
  status: "requested" | "paid" | "rejected";
  created_at: string;
};
