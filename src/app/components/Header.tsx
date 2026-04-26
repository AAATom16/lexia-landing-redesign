import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 7V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V7L12 2Z" fill="white" />
              </svg>
            </div>
            <span className="text-2xl text-[#1a1a2e]">Lexia</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`transition-colors ${location.pathname === '/' ? 'text-[#0066CC]' : 'text-[#1a1a2e] hover:text-[#0066CC]'}`}
            >
              Pro klienty
            </Link>
            <Link
              to="/partnerstvi"
              className={`transition-colors ${location.pathname === '/partnerstvi' ? 'text-[#0066CC]' : 'text-[#1a1a2e] hover:text-[#0066CC]'}`}
            >
              Partnerství
            </Link>
            <a href="#produkty" className="text-[#1a1a2e] hover:text-[#0066CC] transition-colors">
              Produkty
            </a>
            <a href="#kontakt" className="text-[#1a1a2e] hover:text-[#0066CC] transition-colors">
              Kontakt
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => document.getElementById('ucet')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="hidden md:block px-6 py-2.5 text-[#0066CC] hover:bg-[#F7F9FC] rounded-xl transition-all"
            >
              Přihlásit se
            </button>
            <button className="hidden md:block px-6 py-2.5 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white rounded-xl hover:shadow-lg transition-all">
              Sjednat online
            </button>

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
                className="text-[#1a1a2e] hover:text-[#0066CC] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pro klienty
              </Link>
              <Link
                to="/partnerstvi"
                className="text-[#1a1a2e] hover:text-[#0066CC] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Partnerství
              </Link>
              <a href="#produkty" className="text-[#1a1a2e] hover:text-[#0066CC] transition-colors py-2">
                Produkty
              </a>
              <a href="#kontakt" className="text-[#1a1a2e] hover:text-[#0066CC] transition-colors py-2">
                Kontakt
              </a>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => { setIsMenuOpen(false); document.getElementById('ucet')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                  className="px-6 py-2.5 text-[#0066CC] hover:bg-[#F7F9FC] rounded-xl transition-all text-left"
                >
                  Přihlásit se
                </button>
                <button className="px-6 py-2.5 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white rounded-xl hover:shadow-lg transition-all">
                  Sjednat online
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
