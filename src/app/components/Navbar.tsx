'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Scan, Palette, Home, QrCode, ChevronUp } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/qr', label: 'Generator', icon: Scan },
    { href: 'https://color-picker-gray-one.vercel.app/', label: 'Color Picker', icon: Palette },
    { href: '/scan', label: 'Scanner', icon: QrCode },
  ];

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Calculate scroll progress
        const progress = (currentScrollY / (documentHeight - windowHeight)) * 100;
        setScrollProgress(Math.min(progress, 100));

        // Check if at top of page
        setIsAtTop(currentScrollY < 50);

        // Only start hiding after scrolling down a bit (80px threshold)
        if (currentScrollY > 80) {
          if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 5) {
            // Scrolling down - hide navbar
            setIsVisible(false);
          } else if (lastScrollY - currentScrollY > 5) {
            // Scrolling up - show navbar
            setIsVisible(true);
          }
        } else {
          // At top of page - always show navbar
          setIsVisible(true);
        }

        setLastScrollY(currentScrollY);
      }
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          controlNavbar();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // Initial check
    controlNavbar();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.nav
            ref={navRef}
            initial={{ y: -100, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              backdropFilter: isAtTop ? 'blur(0px)' : 'blur(20px)',
              background: isAtTop 
                ? 'rgba(255, 255, 255, 0.25)' 
                : 'rgba(255, 255, 255, 0.95)'
            }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ 
              duration: 0.4, 
              type: 'spring', 
              stiffness: 400, 
              damping: 30 
            }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-lg transition-all duration-300"
            style={{
              background: isAtTop 
                ? 'rgba(255, 255, 255, 0.25)' 
                : 'rgba(255, 255, 255, 0.95)'
            }}
          >
            {/* Scroll Progress Bar */}
            <motion.div 
              className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-2xl"
              style={{ width: `${scrollProgress}%` }}
              transition={{ duration: 0.1 }}
            />
            
            <div className="hidden md:flex items-center justify-center p-2">
              <ul className="flex items-center gap-1 bg-black/5 rounded-xl p-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <motion.div
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`
                            relative flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 font-medium
                            ${isActive 
                              ? 'bg-white text-blue-600 shadow-lg' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-white/80'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                          
                          {isActive && (
                            <motion.div
                              layoutId="nav-indicator"
                              className="absolute inset-0 rounded-lg border-2 border-blue-400/50"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                        </motion.div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="md:hidden p-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 rounded-xl border border-white/20 bg-white/50"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {!isAtTop && !isVisible && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={scrollToTop}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-8 right-8 z-40 glass-effect p-4 rounded-full shadow-2xl border border-white/20 backdrop-blur-lg"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-20 right-4 glass-effect rounded-2xl shadow-2xl border border-white/20 backdrop-blur-lg z-40 md:hidden"
            >
              <ul className="p-4 space-y-2 min-w-[200px]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <li key={item.href}>
                      <Link href={item.href} onClick={() => setIsOpen(false)}>
                        <motion.div
                          whileHover={{ scale: 1.02, x: 5 }}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium
                            ${isActive 
                              ? 'bg-white text-blue-600 shadow-lg' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                          
                          {isActive && (
                            <motion.div
                              layoutId="mobile-nav-indicator"
                              className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                            />
                          )}
                        </motion.div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;