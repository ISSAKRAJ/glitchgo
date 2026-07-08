import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import Services from '../components/sections/Services';
import HowItWorks from '../components/sections/HowItWorks';
import AdminZeroPromo from '../components/sections/AdminZeroPromo';
import ClientForm from '../components/sections/ClientForm';
import ChatWidget from '../components/sections/ChatWidget';

export default function Landing() {
  return (
    <div className="flex flex-col relative w-full h-full">
      <Navbar />
      <main className="flex-1 w-full flex flex-col pt-20">
        <Hero />
        <AdminZeroPromo />
        <Services />
        <HowItWorks />
        <ClientForm />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
