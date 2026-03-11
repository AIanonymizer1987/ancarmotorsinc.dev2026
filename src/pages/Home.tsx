import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Services from '../components/Services';
import FeaturedVehicles from '../components/FeaturedVehicles';
import Testimonials from '../components/Testimonials';
import ContactCTA from '../components/ContactCTA';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <FeaturedVehicles />
        <Testimonials />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}