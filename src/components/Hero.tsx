import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dy3vb87qz/image/upload/v1775920222/background6f5a58ea9a57050f0323_lhpny0_cfe3d8.jpg)',
          backgroundBlendMode: 'overlay'
        }}
      ></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-3xl">
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="ml-2 text-sm">Trusted by 1000+ customers</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ textShadow: '1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000' }}>
            Quality Cars,
            <span className="text-blue-300"> Exceptional Service</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Find your perfect vehicle at Ancar Motors Inc. We offer premium cars, 
            expert maintenance, and financing solutions tailored to your needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/vehicles" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors group">
              Browse Vehicles
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Schedule Test Drive 
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;