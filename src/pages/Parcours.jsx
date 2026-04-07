import { useState, useEffect } from 'react';
import DuolingoPath from '../components/home/DuolingoPath';
import UnderConstruction from '../components/UnderConstruction';
import { getPageModes } from '@/lib/page-modes';

export default function Parcours() {
  const [mode, setMode] = useState(null);
  useEffect(() => { getPageModes().then(m => setMode(m.parcours || 'live')); }, []);
  if (mode === null) return null;
  if (mode === 'construction') {
    return (
      <div className="min-h-screen py-12">
        <UnderConstruction
          title="Le Parcours se forge"
          subtitle="Nous construisons quelque chose d'exceptionnel — un programme d'apprentissage unique pour transformer votre rapport à l'IA et à la finance."
        />
      </div>
    );
  }
  return (
    <div className="min-h-screen py-12 md:py-16">
      <DuolingoPath />
    </div>
  );
}