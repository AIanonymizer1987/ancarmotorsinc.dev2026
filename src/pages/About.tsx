import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Users, Award, Clock, Heart, Shield, Wrench, Leaf, Trophy, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  const [expandedValues, setExpandedValues] = useState([false, false, false]);
  const [expandedMission, setExpandedMission] = useState([false, false, false]);
  const [expandedVision, setExpandedVision] = useState(false);

  const stats = [
    { icon: Users, label: 'Happy Customers', value: '1000+' },
    { icon: Award, label: 'Years of Experience', value: '15+' },
    { icon: Clock, label: 'Vehicles Sold', value: '5000+' },
    { icon: Heart, label: 'Customer Satisfaction', value: '98%' }
  ];

  const values = [
    { icon: Shield, title: 'Integrity', text: 'We believe in honest, transparent dealings with every customer, building trust through our actions.' },
    { icon: Award, title: 'Quality', text: 'Every vehicle in our inventory is carefully inspected to ensure it meets our high standards.' },
    { icon: Wrench, title: 'Service', text: 'Our commitment to exceptional customer service doesn\'t end when you drive off the lot.' }
  ];

  const mission = [
    { icon: Heart, title: 'Support', text: 'Continuously help improve the welfare of our people towards growth within the company.' },
    { icon: Leaf, title: 'Sustainability', text: 'Adhere to the environmental standards and meet the expectations of the clients and stakeholders.' },
    { icon: Trophy, title: 'World Class', text: 'Assure high quality and reliable products.' }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-16 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold featured-heading mb-6">
                About Ancar Motors Inc
              </h1>
              <p className="text-xl featured-heading max-w-3xl mx-auto">
                We're more than just a car dealership. We're your trusted automotive partner, 
                committed to providing exceptional vehicles and service to our community.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Ancar Motors showroom"
                  className="rounded-lg shadow-lg w-full h-96 object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold featured-heading mb-6 flex items-center justify-center">
                  <span className="mr-3">Who Are We?</span>
                </h2>
                <p className="featured-heading mb-4 text-center">
                  Our business is in marketing of imported and reconditioned Japanese trucks, 
                  special-purpose vehicles such as tractor head, tanker, dump and fire trucks, SUVs,
                   and heavy equipment. 
                </p>
                <p className="featured-heading mb-4 text-center">
                  Our company carries Isuzu, Fuso, Mitsubishi, and Suzuki brands 
                  of reliable quality and performance in the Japanese and Philippine market.
                </p>
                <p className="featured-heading text-center">
                  Types of body include standard flat bed, low or high-dropside, palletized, and stake-body.
                   Our company can also provide the standard aluminum van to wing-van type and 
                   customized chiller and freezer vans and any customized body and/or unit preferred.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold featured-heading mb-2">{stat.value}</div>
                    <div className="featured-heading">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {values.map((item, index) => {
                  const IconComponent = item.icon;
                  const isExpanded = expandedValues[index];
                  return (
                    <div key={index} className="text-center">
                      <motion.div
                        className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer"
                        onClick={() => {
                          const newExpanded = [...expandedValues];
                          newExpanded[index] = !newExpanded[index];
                          setExpandedValues(newExpanded);
                        }}
                        animate={{ scale: isExpanded ? 0.8 : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <IconComponent className={`text-blue-600 ${isExpanded ? 'h-8 w-8' : 'h-12 w-12'}`} />
                      </motion.div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                      {isExpanded && (
                        <motion.p
                          className="text-gray-600"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {item.text}
                        </motion.p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-lg p-8 gap-8 mt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {mission.map((item, index) => {
                  const IconComponent = item.icon;
                  const isExpanded = expandedMission[index];
                  return (
                    <div key={index} className="text-center">
                      <motion.div
                        className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer"
                        onClick={() => {
                          const newExpanded = [...expandedMission];
                          newExpanded[index] = !newExpanded[index];
                          setExpandedMission(newExpanded);
                        }}
                        animate={{ scale: isExpanded ? 0.8 : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <IconComponent className={`text-blue-600 ${isExpanded ? 'h-8 w-8' : 'h-12 w-12'}`} />
                      </motion.div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                      {isExpanded && (
                        <motion.p
                          className="text-gray-600"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {item.text}
                        </motion.p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
             <div className="bg-white rounded-lg p-8 gap-8 mt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Vision</h2>
              <div className="text-center gap-8">
                <motion.div
                  className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer"
                  onClick={() => setExpandedVision(!expandedVision)}
                  animate={{ scale: expandedVision ? 0.8 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Eye className={`text-blue-600 ${expandedVision ? 'h-8 w-8' : 'h-12 w-12'}`} />
                </motion.div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Vision</h3>
                {expandedVision && (
                  <motion.p
                    className="text-gray-600 mb-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    To be the leading Filipino-owned truck and heavy equipment importer, distributor and assembler in the Philippine market.
                  </motion.p>
                )}
                <video
                  src="https://res.cloudinary.com/dy3vb87qz/video/upload/v1776599052/IntroAncarmotors.35582d14a9e6f5d93416-C1eUnS3s_r3crty.mp4"
                  controls
                  className="w-full max-w-4xl mx-auto rounded-lg shadow-lg mt-20"
                />
              </div>
            </div>
          </div>
        </section>
        
      </main>
      <Footer />
    </div>
  );
}