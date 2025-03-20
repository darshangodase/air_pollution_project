import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation, useScroll, useTransform } from 'framer-motion';
import { FaLeaf, FaCity, FaChartLine, FaInfoCircle, FaArrowRight, FaWind, FaCloudSun, FaBuilding } from 'react-icons/fa';

const Home = ({ theme }) => {
  const controls = useAnimation();
  const { scrollY } = useScroll();
  
  // Parallax effects
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -30]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  useEffect(() => {
    // Start animations when component mounts
    const sequence = async () => {
      await controls.start("visible");
    };
    sequence();
  }, [controls]);

  const features = [
    {
      icon: <FaLeaf className="text-green-500" />,
      title: "Real-time Air Quality",
      description: "Monitor air quality parameters in real-time from your location or anywhere in the world."
    },
    {
      icon: <FaCity className="text-blue-500" />,
      title: "Urban Health Insights",
      description: "Understand how air quality impacts urban health and get recommendations for improving it."
    },
    {
      icon: <FaChartLine className="text-purple-500" />,
      title: "Data Visualization",
      description: "Interactive visualizations to track air quality trends and understand patterns over time."
    }
  ];

  // Variants for framer-motion animations
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3
      }
    }
  };
  
  const heroVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  const bounceVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" 
      }
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse"
    }
  };

  // Generate particles for air quality visualization
  const particles = Array.from({ length: 25 }, (_, i) => i);

  return (
    <motion.div 
      className="min-h-screen overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section - Completely Redesigned */}
      <section className="py-8 md:py-0 relative min-h-[90vh] flex items-center">
        {/* Animated particle background */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 5 === 0 
                  ? theme === 'dark' ? 'bg-green-400/20' : 'bg-green-500/20' 
                  : i % 5 === 1 
                    ? theme === 'dark' ? 'bg-blue-400/20' : 'bg-blue-500/20'
                    : i % 5 === 2
                      ? theme === 'dark' ? 'bg-yellow-300/20' : 'bg-yellow-400/20'
                      : i % 5 === 3
                        ? theme === 'dark' ? 'bg-purple-400/20' : 'bg-purple-500/20'
                        : theme === 'dark' ? 'bg-gray-400/20' : 'bg-gray-500/20'
              }`}
              style={{
                width: `${Math.random() * 40 + 5}px`,
                height: `${Math.random() * 40 + 5}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                zIndex: Math.floor(Math.random() * 10)
              }}
              animate={{
                x: [0, Math.random() * 100 - 50, 0],
                y: [0, Math.random() * 100 - 50, 0],
                opacity: [0.1, Math.random() * 0.3 + 0.2, 0.1]
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 z-10 relative">
          <div className="flex flex-col items-center text-center mb-16">
            {/* Main Title with Animation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-4"
            >
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
              >
                <motion.span 
                  className={theme === 'dark' ? 'text-white' : 'text-gray-800'}
                >
                  Breathe
                </motion.span>{" "}
                <motion.div 
                  className="inline-block"
                  animate={{ 
                    color: theme === 'dark' 
                      ? ["#4ade80", "#60a5fa", "#4ade80"] 
                      : ["#16a34a", "#2563eb", "#16a34a"]
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  Smarter
                </motion.div>
              </motion.h1>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 opacity-90"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Real-time air quality monitoring for healthy cities and communities
            </motion.p>
            
            {/* Circular AQI Meter */}
            <motion.div 
              className="relative w-64 h-64 md:w-80 md:h-80 mb-12"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Background circle */}
                <circle 
                  cx="50" cy="50" r="45" 
                  stroke={theme === 'dark' ? '#1f2937' : '#f3f4f6'}
                  strokeWidth="10" 
                  fill="none" 
                />
                
                {/* AQI indicator - animated arc */}
                <motion.circle 
                  cx="50" cy="50" r="45" 
                  stroke={theme === 'dark' ? '#4ade80' : '#16a34a'} 
                  strokeWidth="10" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeDasharray="282.7"
                  initial={{ strokeDashoffset: 282.7 }}
                  animate={{ strokeDashoffset: 142 }} // 50% filled for AQI of 50/100
                  transition={{ 
                    duration: 2, 
                    ease: "easeInOut",
                    delay: 0.8
                  }}
                />
                
                {/* Central text */}
                <g className="text-center">
                  <motion.text 
                    x="50" y="45" 
                    textAnchor="middle" 
                    className={`text-3xl font-bold ${theme === 'dark' ? 'fill-white' : 'fill-gray-800'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                  >
                    50
                  </motion.text>
                  <motion.text 
                    x="50" y="60" 
                    textAnchor="middle" 
                    className={`text-lg ${theme === 'dark' ? 'fill-green-400' : 'fill-green-600'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                  >
                    AQI
                  </motion.text>
                  <motion.text 
                    x="50" y="75" 
                    textAnchor="middle" 
                    className={`text-sm ${theme === 'dark' ? 'fill-gray-300' : 'fill-gray-600'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.6 }}
                  >
                    GOOD
                  </motion.text>
                </g>
              </svg>
              
              {/* Animated indicators around the circle */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <motion.div 
                  key={i}
                  className={`absolute w-3 h-3 rounded-full ${
                    i % 3 === 0 
                      ? theme === 'dark' ? 'bg-green-400' : 'bg-green-500' 
                      : i % 3 === 1 
                        ? theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                        : theme === 'dark' ? 'bg-yellow-300' : 'bg-yellow-400'
                  }`}
                  style={{
                    left: `${50 + 45 * Math.cos(angle * Math.PI / 180)}%`,
                    top: `${50 + 45 * Math.sin(angle * Math.PI / 180)}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
              
              {/* Air quality data points */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.8 }}
              >
                <div className="absolute flex space-x-5 top-4 left-1/2 transform -translate-x-1/2">
                  <div className={`text-xs p-1 px-2 rounded-full ${theme === 'dark' ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                    <FaWind className="inline mr-1 text-xs" /> 5 m/s
                  </div>
                  <div className={`text-xs p-1 px-2 rounded-full ${theme === 'dark' ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
                    <span className="mr-1">☀️</span> 25°C
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 items-center mt-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/air-quality" 
                  className={`inline-flex items-center space-x-2 px-8 py-4 rounded-full text-lg font-medium ${
                    theme === 'dark' 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20' 
                      : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20'
                  } transition-all`}
                >
                  <span>Check Your Air Quality</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FaArrowRight />
                  </motion.div>
                </Link>
              </motion.div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center space-x-2 px-8 py-4 rounded-full text-lg font-medium ${
                  theme === 'dark' 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                    : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-lg shadow-gray-200/20'
                } transition-all`}
              >
                <span>How It Works</span>
              </motion.button>
            </motion.div>
          </div>
            
          {/* City Skyline */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 z-0 h-32 md:h-48"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ 
              duration: 1.2, 
              delay: 0.5,
              type: "spring",
              stiffness: 100 
            }}
          >
            <div className="relative h-full">
              {/* Buildings silhouette */}
              <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full">
                <path 
                  fill={theme === 'dark' ? '#1f2937' : '#cbd5e1'} 
                  fillOpacity="1" 
                  d="M0,224L48,202.7C96,181,192,139,288,149.3C384,160,480,224,576,234.7C672,245,768,203,864,170.7C960,139,1056,117,1152,133.3C1248,149,1344,203,1392,229.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                >
                  <animate 
                    attributeName="d" 
                    values="
                      M0,224L48,202.7C96,181,192,139,288,149.3C384,160,480,224,576,234.7C672,245,768,203,864,170.7C960,139,1056,117,1152,133.3C1248,149,1344,203,1392,229.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                      M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,218.7C672,213,768,171,864,149.3C960,128,1056,128,1152,149.3C1248,171,1344,213,1392,234.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                      M0,224L48,202.7C96,181,192,139,288,149.3C384,160,480,224,576,234.7C672,245,768,203,864,170.7C960,139,1056,117,1152,133.3C1248,149,1344,203,1392,229.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    dur="20s"
                    repeatCount="indefinite"
                  />
                </path>
              </svg>
              
              {/* Buildings with windows */}
              <div className="absolute bottom-0 left-0 right-0 h-40 md:h-56 overflow-hidden">
                {[...Array(10)].map((_, i) => {
                  const width = 30 + Math.random() * 60;
                  const height = 40 + Math.random() * 100;
                  const left = (i * 10) + Math.random() * 5 + '%';
                  return (
                    <motion.div
                      key={i}
                      className={`absolute bottom-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-300'}`}
                      style={{ 
                        width: width, 
                        height: height, 
                        left: left
                      }}
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: 0.6 + (i * 0.1),
                        type: "spring" 
                      }}
                    >
                      {/* Building windows */}
                      {[...Array(Math.floor(height / 15))].map((_, j) => (
                        <div key={j} className="flex justify-center mt-3">
                          {[...Array(Math.floor(width / 15))].map((_, k) => (
                            <motion.div
                              key={k}
                              className={`w-2 h-2 md:w-3 md:h-3 mx-1 rounded-sm ${
                                Math.random() > 0.3 
                                  ? theme === 'dark' ? 'bg-yellow-300/70' : 'bg-yellow-500/70' 
                                  : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                              }`}
                              animate={Math.random() > 0.7 ? {
                                opacity: [0.5, 1, 0.5]
                              } : {}}
                              transition={Math.random() > 0.7 ? {
                                duration: 2 + Math.random() * 3,
                                repeat: Infinity,
                                delay: Math.random() * 2
                              } : {}}
                            />
                          ))}
                        </div>
                      ))}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section 
        className={`py-16 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>Key</span> Features
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                whileHover={bounceVariants.hover}
                className={`p-6 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-white hover:bg-gray-50 shadow-lg'
                }`}
                transition={{ delay: index * 0.2 }}
              >
                <motion.div 
                  className="text-3xl mb-4"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section 
        className="py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div 
          className={`container mx-auto px-4 py-12 rounded-2xl ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-green-900/40 to-blue-900/40' 
              : 'bg-gradient-to-r from-green-50 to-blue-50'
          }`}
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, 0, -10, 0],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <FaInfoCircle className={`text-4xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
            </motion.div>
            
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              Ready to monitor your city's air quality?
            </motion.h2>
            
            <motion.p 
              className="text-lg md:text-xl mb-8 opacity-90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
            >
              Start tracking air quality data in real-time and gain insights to help create a healthier urban environment.
            </motion.p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link 
                to="/air-quality" 
                className={`inline-flex items-center space-x-2 px-8 py-4 rounded-full text-lg ${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } transition-all`}
              >
                <span>Check Your Air Quality Now</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FaArrowRight />
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>
    </motion.div>
  );
};

export default Home; 