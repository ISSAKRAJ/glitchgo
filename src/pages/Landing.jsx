import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import Trust from '../components/sections/Trust';
import Services from '../components/sections/Services';
import HowItWorks from '../components/sections/HowItWorks';
import AdminZeroPromo from '../components/sections/AdminZeroPromo';
import Reviews from '../components/sections/Reviews';
import SecurityTerminal from '../components/sections/SecurityTerminal';
import Architecture from '../components/sections/Architecture';
import ClientForm from '../components/sections/ClientForm';
import FinalCta from '../components/sections/FinalCta';
import ChatWidget from '../components/sections/ChatWidget';
import SecurityBenchmarks from '../components/sections/SecurityBenchmarks';
import IntegrationSnippet from '../components/sections/IntegrationSnippet';
import SecurityPricing from '../components/sections/SecurityPricing';
import SecurityOnboarding from '../components/sections/SecurityOnboarding';

export default function Landing() {
  return (
    <div className="flex flex-col relative w-full h-full">
      <Navbar />
      <main className="flex-1 w-full flex flex-col pt-20">
        <Hero />
        <AdminZeroPromo />
        <SecurityOnboarding />
        <SecurityBenchmarks />
        <Reviews />
        <Trust />
        <Services />
        <HowItWorks />
        <IntegrationSnippet />
        <SecurityTerminal />
        <Architecture />
        <SecurityPricing />
        <ClientForm />
        <FinalCta />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
