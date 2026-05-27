import type { Metadata } from "next";
import { BarChart3, Building2, Download, FileSearch, LayoutDashboard, Search, Settings, Table2, Upload } from "lucide-react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lead CRM",
  description: "CRM local para prospecção e organização de leads comerciais."
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Table2 },
  { href: "/crm", label: "CRM", icon: BarChart3 },
  { href: "/search", label: "Buscar Leads", icon: Search },
  { href: "/cnpj-search", label: "Buscar CNPJ", icon: Building2 },
  { href: "/tools/url-extractor", label: "Extrair URLs", icon: FileSearch },
  { href: "/import", label: "Importar", icon: Upload },
  { href: "/settings", label: "Configurações", icon: Settings }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
          <aside className="border-b border-line bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
            <div className="flex h-16 items-center gap-3 border-b border-line px-5">
              <div className="flex size-10 items-center justify-center rounded-md bg-brand text-white">
                <Download size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Lead CRM</p>
                <p className="text-xs text-muted">Prospecção local</p>
              </div>
            </div>
            <nav className="flex gap-1 overflow-x-auto p-3 lg:block">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-panel hover:text-ink"
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
