import { Navigate, useSearchParams } from 'react-router';

/** Legacy route — opens unified Configuration on Content → Header. */
export default function AdminHeaderFooterRedirect() {
  const [params] = useSearchParams();
  const section = params.get('section') === 'footer' ? 'content-footer' : 'content-header';
  return <Navigate to={`/settings?section=${section}`} replace />;
}
