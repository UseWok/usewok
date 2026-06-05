import { Navigate } from 'react-router-dom';
export default function DashboardHome() {
  return <Navigate to="/admin/overview" replace />;
}