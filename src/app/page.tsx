import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/landing/Hero';
import { StatsBanner } from '@/components/landing/Stats';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <Navbar />
      <Hero />
      <StatsBanner />
      <FeatureGrid />
      <Footer />
    </main>
  );
}
