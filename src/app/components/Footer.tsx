import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser } from '../lib/auth';

export function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  function handleAnchor(e: React.MouseEvent, hash: string) {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', '/' + hash);
    } else {
      navigate('/' + hash);
    }
  }

  function handleClientZone(e: React.MouseEvent) {
    e.preventDefault();
    navigate(getUser() ? '/ucet' : '/prihlaseni');
  }

  return (
    <footer className="bg-[#0a0a0f] text-white border-t border-white/5">
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0045BF] to-[#001843] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 7V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V7L12 2Z" fill="white" />
                </svg>
              </div>
              <span className="text-2xl">Lexia</span>
            </Link>
            <p className="text-white/60 mb-6 max-w-sm">
              Moderní platforma pro partnery. Digitální právní ochrana, kterou prodáte během minut.
            </p>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                <div className="text-xs text-white/50 mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-white">Systém běží</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm text-white/50 mb-4">Platforma</h4>
            <ul className="space-y-3">
              <li>
                <a href="/prihlaseni" onClick={handleClientZone} className="text-white/70 hover:text-white transition-colors text-sm">
                  Klientská zóna
                </a>
              </li>
              <li>
                <Link to="/prihlaseni" className="text-white/70 hover:text-white transition-colors text-sm">
                  Přihlášení
                </Link>
              </li>
              <li>
                <Link to="/crm" className="text-white/70 hover:text-white transition-colors text-sm">
                  CRM Demo
                </Link>
              </li>
              <li>
                <Link to="/partnerstvi" className="text-white/70 hover:text-white transition-colors text-sm">
                  Partnerství
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm text-white/50 mb-4">Produkty</h4>
            <ul className="space-y-3">
              <li>
                <a href="/#produkty" onClick={(e) => handleAnchor(e, '#produkty')} className="text-white/70 hover:text-white transition-colors text-sm">
                  Přehled produktů
                </a>
              </li>
              <li>
                <a href="/#ucet" onClick={(e) => handleAnchor(e, '#ucet')} className="text-white/70 hover:text-white transition-colors text-sm">
                  Klientský portál
                </a>
              </li>
              <li>
                <Link to="/partnerstvi" className="text-white/70 hover:text-white transition-colors text-sm">
                  Partner Academy
                </Link>
              </li>
              <li>
                <a href="/#kontakt" onClick={(e) => handleAnchor(e, '#kontakt')} className="text-white/70 hover:text-white transition-colors text-sm">
                  Kontakt
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm text-white/50 mb-4">Společnost</h4>
            <ul className="space-y-3">
              <li>
                <a href="/#kontakt" onClick={(e) => handleAnchor(e, '#kontakt')} className="text-white/70 hover:text-white transition-colors text-sm">
                  O nás
                </a>
              </li>
              <li>
                <Link to="/partnerstvi" className="text-white/70 hover:text-white transition-colors text-sm">
                  Kariéra
                </Link>
              </li>
              <li>
                <a href="/#kontakt" onClick={(e) => handleAnchor(e, '#kontakt')} className="text-white/70 hover:text-white transition-colors text-sm">
                  Kontakt
                </a>
              </li>
              <li>
                <a href="/#kontakt" onClick={(e) => handleAnchor(e, '#kontakt')} className="text-white/70 hover:text-white transition-colors text-sm">
                  Právní info
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-xs text-white/50">
              <span>© 2026 Lexia</span>
              <span>•</span>
              <a href="/#kontakt" onClick={(e) => handleAnchor(e, '#kontakt')} className="hover:text-white transition-colors">Ochrana údajů</a>
              <span>•</span>
              <a href="/#kontakt" onClick={(e) => handleAnchor(e, '#kontakt')} className="hover:text-white transition-colors">Podmínky užití</a>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Platforma online</span>
              </div>
              <div className="text-xs text-white/50">
                Uptime: 99.9%
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
