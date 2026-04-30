import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Calculator, FileText, Home, LayoutDashboard, LogOut, ShieldCheck, Users } from 'lucide-react';
import { getUser, logout, type AuthUser } from '../../lib/auth';

export function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(getUser());

  useEffect(() => {
    const sync = () => setUser(getUser());
    window.addEventListener('lexia-auth-change', sync);
    return () => window.removeEventListener('lexia-auth-change', sync);
  }, []);

  if (!user || user.role !== 'distributor') {
    return <Navigate to="/portal/prihlaseni" state={{ from: location.pathname }} replace />;
  }

  const navItems = [
    { to: '/portal', label: 'Přehled', icon: LayoutDashboard, end: true },
    { to: '/portal/kalkulacka', label: 'Kalkulačka', icon: Calculator },
    { to: '/portal/sjednani', label: 'Sjednání', icon: FileText },
    { to: '/portal/klienti', label: 'Klienti', icon: Users },
  ];

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <header className="sticky top-0 z-30 bg-white border-b border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/portal" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0045BF] to-[#001843] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-base leading-tight">Lexia Partner</div>
                  <div className="text-xs text-muted-foreground">Distribuční portál</div>
                </div>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                          isActive ? 'bg-[#0045BF]/10 text-[#0045BF]' : 'text-foreground hover:bg-[#F7F9FC]'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.75} /> {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/" className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#0045BF]">
                <Home className="w-4 h-4" /> Web
              </Link>
              <div className="text-right hidden sm:block">
                <div className="text-sm">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.distributorType ?? 'VZ'} · {user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg border border-border hover:bg-[#F7F9FC] transition-colors"
                title="Odhlásit"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
