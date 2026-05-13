import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function saveCart() {} // Fallback pour éviter les erreurs d'imports existants
export function clearCart() {}
export function getCart() { return null; }

export default function CheckoutPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/pricing', { replace: true }); }, [navigate]);
  return null;
}