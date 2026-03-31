import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BranchesCarousel from '../components/BranchesCarousel';

export default function Contact() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <BranchesCarousel />
      </main>
      <Footer />
    </div>
  );
}