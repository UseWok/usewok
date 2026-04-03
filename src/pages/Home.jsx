import HeroSection from '../components/home/HeroSection';
import RecentApps from '../components/home/RecentApps';
import DuolingoPath from '../components/home/DuolingoPath';

export default function Home() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <HeroSection />
      <RecentApps />
      <DuolingoPath />
    </div>
  );
}