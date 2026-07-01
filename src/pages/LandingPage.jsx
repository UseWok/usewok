import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import OnboardingQuizModal from '@/components/landing/OnboardingQuizModal';
import LandingNavbar from '@/components/landing/LandingNavbar';
import LandingHero from '@/components/landing/LandingHero';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import PricingSection from '@/components/landing/PricingSection';
import WhyUseWokSection from '@/components/landing/WhyUseWokSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FAQSection from '@/components/landing/FAQSection';
import AboutSection from '@/components/landing/AboutSection';
import LandingFooterSection from '@/components/landing/LandingFooterSection';

const BG = '#0A0A0B';
const F = "'Inter', -apple-system, system-ui, sans-serif";

export default function LandingPage() {
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#0A0A0B';
    document.body.style.color = '#F0F0EE';
    document.documentElement.style.backgroundColor = '#0A0A0B';
    const style = document.createElement('style');
    style.id = 'lp-dark-override';
    style.textContent = `#root::before { display: none !important; } body { background-color: #0A0A0B !important; }`;
    document.head.appendChild(style);
    return () => {
      document.body.style.backgroundColor = prev;
      document.body.style.color = '';
      document.documentElement.style.backgroundColor = '';
      document.getElementById('lp-dark-override')?.remove();
    };
  }, []);

  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated()
      .then(a => { if (a) navigate('/app', { replace: true }); else setReady(true); })
      .catch(() => setReady(true));
  }, [navigate]);

  if (!ready) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  const onSignup = () => base44.auth.redirectToLogin('/app');
  const onStartQuiz = () => setShowQuiz(true);
  const onQuizComplete = (answers) => {
    setShowQuiz(false);
    const pendingUrl = localStorage.getItem('wok_pending_url');
    if (pendingUrl) sessionStorage.setItem('wok_post_login_url', pendingUrl);
    if (answers) sessionStorage.setItem('wok_post_login_quiz', JSON.stringify(answers));
    base44.auth.redirectToLogin('/app');
  };
  const onQuizSkip = () => {
    setShowQuiz(false);
    const pendingUrl = localStorage.getItem('wok_pending_url');
    if (pendingUrl) sessionStorage.setItem('wok_post_login_url', pendingUrl);
    base44.auth.redirectToLogin('/app');
  };

  return (
    <div style={{ background: BG, fontFamily: F }}>
      <AnimatePresence>
        {showQuiz && <OnboardingQuizModal onComplete={onQuizComplete} onSkip={onQuizSkip} />}
      </AnimatePresence>

      <div style={{
        position: 'fixed', top: 58, left: 0, right: 0, zIndex: 299, height: 3,
        background: 'linear-gradient(90deg, #1C3D6E 0%, #1C3D6E 33.33%, rgba(240,238,232,0.18) 33.33%, rgba(240,238,232,0.18) 66.66%, #7A2820 66.66%, #7A2820 100%)',
        opacity: 0.85,
      }} />

      <LandingNavbar onSignup={onSignup} />
      <LandingHero onStartQuiz={onStartQuiz} />
      <HowItWorksSection />
      <PricingSection onSignup={onSignup} />
      <WhyUseWokSection />
      <TestimonialsSection />
      <FAQSection />
      <AboutSection />
      <LandingFooterSection />
    </div>
  );
}