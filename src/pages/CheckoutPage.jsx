import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Le Checkout interne est supprimé. Les utilisateurs sont redirigés vers le Pricing 
// où les liens Stripe officiels gèrent le paiement (Méthode Notion/Vercel).

export default function CheckoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/pricing', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-400 font-sans text-sm">Redirecting to pricing...</p>
    </div>
  );
}