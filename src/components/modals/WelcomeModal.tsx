'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiMusic, FiHeart, FiHeadphones } from 'react-icons/fi';

type WelcomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      icon: <FiMusic className="text-6xl text-primary mb-6" />,
      title: "Selamat Datang di Oyagema",
      description: "Platform meditasi dan relaksasi dengan koleksi audio berkualitas tinggi untuk membantu Anda menemukan ketenangan dalam kehidupan sehari-hari.",
      features: [
        "🎵 Koleksi audio meditasi premium",
        "🧘‍♀️ Berbagai kategori relaksasi",
        "📱 Akses mudah di semua perangkat",
        "🎧 Kualitas audio terbaik"
      ]
    },
    {
      id: 2,
      icon: <FiHeart className="text-6xl text-accent mb-6" />,
      title: "Dukung Oyagema",
      description: "Oyagema adalah platform gratis yang didedikasikan untuk kesehatan mental. Dukungan Anda membantu kami terus menyediakan konten berkualitas.",
      features: [
        "💝 Donasi sukarela untuk keberlanjutan",
        "🌱 Membantu pengembangan fitur baru",
        "🤝 Mendukung komunitas kesehatan mental",
        "🎯 100% untuk pengembangan platform"
      ]
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleFinish = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-background-light to-background w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-background-dark/20 transition-colors"
            >
              <FiX className="text-text-secondary" size={20} />
            </button>
            
            {/* Slide Indicators */}
            <div className="flex justify-center space-x-2 mb-6">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-primary' : 'bg-background-dark/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Slide Content */}
          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  {slides[currentSlide].icon}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  {slides[currentSlide].title}
                </h2>

                {/* Description */}
                <p className="text-text-secondary mb-6 leading-relaxed">
                  {slides[currentSlide].description}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {slides[currentSlide].features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-left text-text-primary bg-background-dark/20 rounded-lg p-3"
                    >
                      {feature}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center p-6 pt-0">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentSlide === 0
                  ? 'text-text-muted cursor-not-allowed'
                  : 'text-text-primary hover:bg-background-dark/20'
              }`}
            >
              <FiChevronLeft size={16} />
              <span>Sebelumnya</span>
            </button>

            {currentSlide === slides.length - 1 ? (
              <button
                onClick={handleFinish}
                className="flex items-center space-x-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                <FiHeadphones size={16} />
                <span>Mulai Mendengarkan</span>
              </button>
            ) : (
              <button
                onClick={nextSlide}
                className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                <span>Selanjutnya</span>
                <FiChevronRight size={16} />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeModal;