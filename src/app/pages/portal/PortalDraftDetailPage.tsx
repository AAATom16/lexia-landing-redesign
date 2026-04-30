import { useNavigate, useParams } from 'react-router-dom';
import { DraftDetail } from '../../components/drafts/DraftDetail';

export function PortalDraftDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return null;
  return <DraftDetail id={id} onBack={() => navigate('/portal/sjednani')} homeLabel="Zpět na seznam" />;
}
