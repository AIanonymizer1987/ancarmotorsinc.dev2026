import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Phone, Clock } from 'lucide-react';
import { branches } from '../data/branches';

export default function BranchesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? branches.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === branches.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentBranch = branches[currentIndex];

  const openCurrentMap = () => {
    const queryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      currentBranch.address
    )}`;
    window.open(queryUrl, '_blank', 'noopener noreferrer');
  };

  const handleContact = async () => {
    const phone = currentBranch.phone;
    const sanitizedTel = phone.replace(/[^+\d]/g, '');

    try {
      await navigator.clipboard.writeText(phone);
    } catch (error) {
      console.warn('Unable to copy phone number to clipboard:', error);
    }

    window.location.href = `tel:${sanitizedTel}`;
  };


  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold contact-heading mb-4">
            Visit Our Branches
          </h2>
          <p className="text-xl contact-heading max-w-3xl mx-auto">
            Find your nearest Ancar Motors location and experience our exceptional service firsthand.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Map Section */}
            <div className="relative h-80 lg:h-full min-h-96 bg-gray-200 overflow-hidden">
              <iframe
                src={currentBranch.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${currentBranch.name}`}
                className="w-full h-full"
              ></iframe>
              
              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-md transition-all hover:shadow-lg z-10"
                aria-label="Previous branch"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-md transition-all hover:shadow-lg z-10"
                aria-label="Next branch"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {branches.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-blue-600 w-8'
                        : 'bg-white/50 hover:bg-white/70 w-2'
                    }`}
                    aria-label={`Go to branch ${index + 1}`}
                    aria-current={index === currentIndex}
                  />
                ))}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentBranch.name}
                </h3>
                <p className="text-lg text-blue-600 font-semibold">
                  {currentBranch.city}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Address</p>
                    <p className="text-gray-600">{currentBranch.address}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Phone</p>
                    <a href={`tel:${currentBranch.phone}`} className="text-blue-600 hover:text-blue-700">
                      {currentBranch.phone}
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Hours</p>
                    <p className="text-gray-600">{currentBranch.hours}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={openCurrentMap}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                  type="button"
                >
                  Get Directions
                </button>
                <button
                  onClick={handleContact}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-semibold transition-colors"
                  type="button"
                >
                  Contact
                </button>
              </div>

              {/* Slide Counter */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-center text-sm text-gray-500">
                  Location {currentIndex + 1} of {branches.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
