import { Menu, X, User, LogOut, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser, logout, type AuthUser } from '../lib/auth';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(getUser());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function sync() {
      setUser(getUser());
    }
    window.addEventListener('lexia-auth-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('lexia-auth-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    setUser(getUser());
  }, [location.pathname]);

  function scrollToHash(hash: string) {
    requestAnimationFrame(() => {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function handleAnchor(e: React.MouseEvent, hash: string) {
    e.preventDefault();
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      scrollToHash(hash);
      window.history.replaceState(null, '', '/' + hash);
    } else {
      navigate('/' + hash);
      setTimeout(() => scrollToHash(hash), 80);
    }
  }

  function handleLoginClick() {
    if (user) navigate('/ucet');
    else navigate('/prihlaseni');
  }

  function handleClientZone() {
    setIsMenuOpen(false);
    if (user) navigate('/ucet');
    else navigate('/prihlaseni');
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleSjednat(e: React.MouseEvent) {
    e.preventDefault();
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  }

  const isOnHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0045BF] to-[#001843] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 7V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V7L12 2Z" fill="white" />
              </svg>
            </div>
            <span className="text-2xl text-[#1a1a2e]">Lexia</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <Link
              to="/"
              className={`transition-colors ${isOnHome ? 'text-[#0045BF]' : 'text-[#1a1a2e] hover:text-[#0045BF]'}`}
            >
              Pro klienty
            </Link>
            <Link
              to="/partnerstvi"
              className={`transition-colors ${location.pathname === '/partnerstvi' ? 'text-[#0045BF]' : 'text-[#1a1a2e] hover:text-[#0045BF]'}`}
            >
              Partnerství
            </Link>
            <a
              href="/#produkty"
              onClick={(e) => handleAnchor(e, '#produkty')}
              className="text-[#1a1a2e] hover:text-[#0045BF] transition-colors"
            >
              Produkty
            </a>
            <a
              href="/#kontakt"
              onClick={(e) => handleAnchor(e, '#kontakt')}
              className="text-[#1a1a2e] hover:text-[#0045BF] transition-colors"
            >
              Kontakt
            </a>
            <Link
              to="/crm"
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0045BF]/10 to-[#001843]/10 border border-[#0045BF]/20 text-[#0045BF] text-sm hover:from-[#0045BF]/15 hover:to-[#001843]/15 transition-colors"
            >
              CRM Demo
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/ucet')}
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 text-[#0045BF] hover:bg-[#F7F9FC] rounded-xl transition-all"
                >
                  <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
                  <span className="max-w-[10rem] truncate">{user.name}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 px-3 py-2.5 border border-border text-foreground rounded-xl hover:bg-[#F7F9FC] transition-all"
                  title="Odhlásit"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleClientZone}
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 text-[#0045BF] hover:bg-[#F7F9FC] rounded-xl transition-all border border-[#0045BF]/20"
                >
                  <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
                  Klientská zóna
                </button>
                <button
                  onClick={handleSjednat}
                  className="hidden md:block px-6 py-2.5 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Sjednat online
                </button>
              </>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-[#F7F9FC] rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-[#1a1a2e] hover:text-[#0045BF] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pro klienty
              </Link>
              <Link
                to="/partnerstvi"
                className="text-[#1a1a2e] hover:text-[#0045BF] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Partnerství
              </Link>
              <a
                href="/#produkty"
                onClick={(e) => handleAnchor(e, '#produkty')}
                className="text-[#1a1a2e] hover:text-[#0045BF] transition-colors py-2"
              >
                Produkty
              </a>
              <a
                href="/#kontakt"
                onClick={(e) => handleAnchor(e, '#kontakt')}
                className="text-[#1a1a2e] hover:text-[#0045BF] transition-colors py-2"
              >
                Kontakt
              </a>
              <Link
                to="/crm"
                onClick={() => setIsMenuOpen(false)}
                className="text-[#0045BF] py-2"
              >
                CRM Demo
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                {user ? (
                  <>
                    <button
                      onClick={() => { setIsMenuOpen(false); navigate('/ucet'); }}
                      className="px-6 py-2.5 text-[#0045BF] hover:bg-[#F7F9FC] rounded-xl transition-all text-left flex items-center gap-2 border border-[#0045BF]/20"
                    >
                      <ShieldCheck className="w-4 h-4" strokeWidth={1.75} /> {user.name}
                    </button>
                    <button
                      onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                      className="px-6 py-2.5 border border-border text-foreground rounded-xl hover:bg-[#F7F9FC] transition-all text-left flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={1.75} /> Odhlásit
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleClientZone}
                      className="px-6 py-2.5 text-[#0045BF] hover:bg-[#F7F9FC] rounded-xl transition-all text-left flex items-center gap-2 border border-[#0045BF]/20"
                    >
                      <ShieldCheck className="w-4 h-4" strokeWidth={1.75} /> Klientská zóna
                    </button>
                    <button
                      onClick={handleSjednat}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      Sjednat online
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
