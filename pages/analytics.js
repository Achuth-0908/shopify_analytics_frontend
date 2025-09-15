import { useAnalytics } from '../hooks/useAnalytics';
import { LoadingSpinner } from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import XenoDashboard from '../components/XenoDashboard';

export default function AnalyticsPage() {
  return (
    <ErrorBoundary>
      <XenoDashboard />
    </ErrorBoundary>
  );
}
