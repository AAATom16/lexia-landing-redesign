import { Menu, X, User, LogOut } from 'lucide-react';
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

  function handleLoginClick() {
    if (user) navigate('/ucet');
    else navigate('/prihlaseni');
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

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

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`transition-colors ${location.pathname === '/' ? 'text-[#0045BF]' : 'text-[#1a1a2e] hover:text-[#0045BF]'}`}
            >
              Pro klienty
            </Link>
            <Link
              to="/partnerstvi"
              className={`transition-colors ${location.pathname === '/partnerstvi' ? 'text-[#0045BF]' : 'text-[#1a1a2e] hover:text-[#0045BF]'}`}
            >
              Partnerství
            </Link>
            <a href="#produkty" className="text-[#1a1a2e] hover:text-[#0045BF] transition-colors">
              Produkty
            </a>
            <a href="#kontakt" className="text-[#1a1a2e] hover:text-[#0045BF] transition-colors">
              Kontakt
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/ucet')}
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 text-[#0045BF] hover:bg-[#F7F9FC] rounded-xl transition-all"
                >
                  <User className="w-4 h-4" strokeWidth={1.75} />
                  <span className="max-w-[10rem] truncate">{user.name}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl hover:bg-[#F7F9FC] transition-all"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.75} />
                  Odhlásit
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLoginClick}
                  className="hidden md:block px-6 py-2.5 text-[#0045BF] hover:bg-[#F7F9FC] rounded-xl transition-all"
                >
                  Přihlásit se
                </button>
                <button className="hidden md:block px-6 py-2.5 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl hover:shadow-lg transition-all">
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
              <a href="#produkty" className="text-[#1a1a2e] hover:text-[#0045BF] transition-colors py-2">
                Produkty
              </a>
              <a href="#kontakt" className="text-[#1a1a2e] hover:text-[#0045BF] transition-colors py-2">
                Kontakt
              </a>
              <div className="flex flex-col gap-2 pt-2">
                {user ? (
                  <>
                    <button
                      onClick={() => { setIsMenuOpen(false); navigate('/ucet'); }}
                      className="px-6 py-2.5 text-[#0045BF] hover:bg-[#F7F9FC] rounded-xl transition-all text-left flex items-center gap-2"
                    >
                      <User className="w-4 h-4" strokeWidth={1.75} /> {user.name}
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
                      onClick={() => { setIsMenuOpen(false); handleLoginClick(); }}
                      className="px-6 py-2.5 text-[#0045BF] hover:bg-[#F7F9FC] rounded-xl transition-all text-left"
                    >
                      Přihlásit se
                    </button>
                    <button className="px-6 py-2.5 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl hover:shadow-lg transition-all">
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
