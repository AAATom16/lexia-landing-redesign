import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PartnersPage } from './pages/PartnersPage';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';
import { CrmLayout } from './pages/crm/CrmLayout';
import { CrmDashboardPage } from './pages/crm/CrmDashboardPage';
import { CrmClientsPage } from './pages/crm/CrmClientsPage';
import { CrmClientDetailPage } from './pages/crm/CrmClientDetailPage';
import { CrmContractsPage } from './pages/crm/CrmContractsPage';
import { CrmDocumentsPage } from './pages/crm/CrmDocumentsPage';
import { CrmTasksPage } from './pages/crm/CrmTasksPage';
import { CrmLeadsPage } from './pages/crm/CrmLeadsPage';

function MarketingChrome({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isCrm = location.pathname.startsWith('/crm');
  if (isCrm) return <>{children}</>;
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MarketingChrome>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/partnerstvi" element={<PartnersPage />} />
          <Route path="/prihlaseni" element={<LoginPage />} />
          <Route path="/ucet" element={<AccountPage />} />
          <Route path="/crm" element={<CrmLayout />}>
            <Route index element={<CrmDashboardPage />} />
            <Route path="klienti" element={<CrmClientsPage />} />
            <Route path="klienti/:id" element={<CrmClientDetailPage />} />
            <Route path="smlouvy" element={<CrmContractsPage />} />
            <Route path="dokumenty" element={<CrmDocumentsPage />} />
            <Route path="ukoly" element={<CrmTasksPage />} />
            <Route path="leady" element={<CrmLeadsPage />} />
          </Route>
        </Routes>
      </MarketingChrome>
    </BrowserRouter>
  );
}
