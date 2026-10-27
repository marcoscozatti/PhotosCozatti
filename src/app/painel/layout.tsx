export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/Sidebar";
import { UserMenu } from "@/components/UserMenu";
import { getProfile } from "@/lib/data";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const { profile, email, demo } = await getProfile();
  return (
    <div className="min-h-screen lg:pl-60">
      <Sidebar />
      {demo && (
        <div className="bg-brand-100 px-4 py-2 text-center text-sm text-amber-900">
          Modo demonstração: os dados são de exemplo. Configure o Supabase para usar de verdade.
        </div>
      )}
      <header className="flex items-center justify-end gap-3 px-4 py-4 sm:px-8">
        <UserMenu
          name={profile.full_name ?? email}
          email={email}
          plan={profile.plan}
          fee={Number(profile.fee_percent)}
          demo={demo}
        />
      </header>
      <main className="px-4 pb-24 sm:px-8 lg:pb-10">{children}</main>
    </div>
  );
}
