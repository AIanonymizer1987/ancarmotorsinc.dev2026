import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center justify-center">ANCAR MOTORS INC</h3>
            <p className="text-gray-300 mb-4">
              Your trusted partner for quality vehicles and exceptional automotive services. 
              We've been serving our community with integrity and excellence for years.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center justify-center">
              <span className="mr-3">Quick Links</span>
            </h4>
            <ul className="space-y-2 text-center">
              <li><a href="/about" className="text-gray-300 hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="/services" className="text-gray-300 hover:text-blue-400 transition-colors">Services</a></li>
              <li><a href="/inventory" className="text-gray-300 hover:text-blue-400 transition-colors">Inventory</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center justify-center">
              <span className="mr-3">Contact Info</span>
            </h4>
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center">
                <Phone className="h-5 w-5 text-blue-400 mr-3" />
                <span className="text-gray-300">0969 488 7777</span>
              </div>
              <div className="flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-400 mr-3" />
                <span className="text-gray-300">ancarmotorsinc1@gmail.com</span>
              </div>
              <div className="flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-400 mr-3 mt-1" />
                <span className="text-gray-300">Ground Floor, Azure Business Center<br />197-A Epifanio de los Santos Ave<br />1105 Metro Manila</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2026 Ancar Motors Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;