import { useNavigate, useParams } from 'react-router-dom';
import { DraftDetail } from '../../components/drafts/DraftDetail';

export function CrmDraftDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return null;
  return <DraftDetail id={id} onBack={() => navigate('/crm/smlouvy')} homeLabel="Zpět na CRM smlouvy" />;
}
