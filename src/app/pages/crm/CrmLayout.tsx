import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderOpen,
  CheckSquare,
  Sparkles,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Globe,
  ShieldCheck,
  Calculator,
  LogOut,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getUser, logout, type AuthUser } from '../../lib/auth';

const navItems = [
  { to: '/crm', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/crm/leady', label: 'Leady', icon: Sparkles },
  { to: '/crm/klienti', label: 'Klienti', icon: Users },
  { to: '/crm/smlouvy', label: 'Smlouvy', icon: FileText },
  { to: '/crm/kalkulacka', label: 'Kalkulačka', icon: Calculator },
  { to: '/crm/dokumenty', label: 'Dokumenty', icon: FolderOpen },
  { to: '/crm/ukoly', label: 'Úkoly', icon: CheckSquare },
];

const breadcrumbMap: Record<string, string> = {
  crm: 'Lexia CRM',
  klienti: 'Klienti',
  smlouvy: 'Smlouvy',
  dokumenty: 'Dokumenty',
  ukoly: 'Úkoly',
  leady: 'Leady',
  kalkulacka: 'Kalkulačka',
};

export function CrmLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(getUser());

  useEffect(() => {
    const sync = () => setUser(getUser());
    window.addEventListener('lexia-auth-change', sync);
    return () => window.removeEventListener('lexia-auth-change', sync);
  }, []);

  const crumbs = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.map((p, i) => ({
      label: breadcrumbMap[p] ?? decodeURIComponent(p),
      to: '/' + parts.slice(0, i + 1).join('/'),
    }));
  }, [location.pathname]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/crm/prihlaseni" state={{ from: location.pathname }} replace />;
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  const initials = user.name
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#1a1a2e]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-white lg:flex">
        <Link to="/crm" className="flex items-center gap-3 border-b border-border px-6 h-20">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0045BF] to-[#001843] flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 7V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V7L12 2Z" fill="white" />
            </svg>
          </div>
          <div>
            <div className="text-xl leading-none">Lexia</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">CRM Platform</div>
          </div>
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="px-3 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Pracovní plocha</div>
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-[#0045BF] to-[#001843] text-white shadow-sm'
                          : 'text-[#1a1a2e] hover:bg-[#F7F9FC]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 px-3 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Přepnout</div>
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                to="/"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#1a1a2e] hover:bg-[#F7F9FC] transition-colors"
              >
                <Globe className="w-4 h-4" strokeWidth={1.75} />
                Web Lexia
              </Link>
            </li>
            <li>
              <Link
                to="/ucet"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#1a1a2e] hover:bg-[#F7F9FC] transition-colors"
              >
                <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
                Klientská zóna
              </Link>
            </li>
            <li>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#1a1a2e] hover:bg-[#F7F9FC] transition-colors">
                <Settings className="w-4 h-4" strokeWidth={1.75} />
                Konfigurace
              </button>
            </li>
          </ul>
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#F7F9FC] p-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0045BF] to-[#001843] flex items-center justify-center text-white font-medium">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-white text-muted-foreground hover:text-red-600 transition-colors"
              title="Odhlásit"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur-sm">
          <div className="flex h-16 items-center gap-4 px-6 lg:px-8">
            <nav className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
              {crumbs.map((c, i) => (
                <div key={c.to} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
                  <span className={i === crumbs.length - 1 ? 'text-[#1a1a2e]' : ''}>{c.label}</span>
                </div>
              ))}
            </nav>

            <div className="flex-1" />

            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F7F9FC] border border-border w-72">
              <Search className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Hledat klienty, smlouvy, dokumenty…"
                className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground"
              />
              <kbd className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded bg-white border border-border text-muted-foreground">⌘K</kbd>
            </div>

            <button className="relative p-2 rounded-xl hover:bg-[#F7F9FC] transition-colors">
              <Bell className="w-5 h-5 text-[#1a1a2e]" strokeWidth={1.75} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#df1929]" />
            </button>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0045BF]/10 to-[#001843]/10 border border-[#0045BF]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[#008EA5]" />
              <span className="text-xs font-medium text-[#0045BF]">Demo prostředí</span>
            </div>
          </div>
        </header>

        <main className="px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
