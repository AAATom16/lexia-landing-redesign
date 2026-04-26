import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PartnersPage } from './pages/PartnersPage';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/partnerstvi" element={<PartnersPage />} />
          <Route path="/prihlaseni" element={<LoginPage />} />
          <Route path="/ucet" element={<AccountPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
