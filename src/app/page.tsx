"use client";
import { AnimatePresence, motion } from 'framer-motion';
import SleekFooter from './components/Footer';
import { useState } from 'react';
import { 
  QrCode, Github, Zap, Sparkles, Palette, Scan, Shield, Infinity, ChevronDown, Camera
} from 'lucide-react';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const features = [
    {
      icon: Palette,
      title: "Custom Designs",
      description: "Full control over colors, styles, and branding with logo support",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Scan,
      title: "Advanced Scanning",
      description: "Camera & image upload scanning with instant results",
      gradient: "from-purple-500 to-blue-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate and scan QR codes in milliseconds",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "All processing happens locally in your browser",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Infinity,
      title: "Unlimited Usage",
      description: "Generate as many QR codes as you need, completely free",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Github,
      title: "Open Source",
      description: "Built with Next.js 14, Tailwind CSS, and Framer Motion",
      gradient: "from-gray-500 to-slate-500"
    }
  ];

  const faqs = [
    {
      question: "Is QR Genius Pro really free to use?",
      answer: "Yes! QR Genius Pro is completely free with no limitations. You can generate unlimited QR codes and use all features without any cost."
    },
    {
      question: "What types of QR codes can I generate?",
      answer: "You can create QR codes for URLs, text, email addresses, phone numbers, WiFi credentials, and much more with full customization options."
    },
    {
      question: "Can I add my company logo to QR codes?",
      answer: "Absolutely! Our advanced QR generator supports logo embedding with size control and background dot hiding for perfect branding."
    },
    {
      question: "How do I scan QR codes from images?",
      answer: "Simply upload any image containing a QR code, and our advanced scanner will instantly detect and decode it for you."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! All processing happens locally in your browser. We don't store any of your data on our servers."
    },
    {
      question: "What browsers are supported?",
      answer: "QR Genius Pro works on all modern browsers including Chrome, Firefox, Safari, and Edge. Camera scanning requires HTTPS."
    }
  ];

  const stats = [
    { number: "10,000+", label: "QR Codes Generated" },
    { number: "99.9%", label: "Scan Success Rate" },
    { number: "50+", label: "Customization Options" },
    { number: "0", label: "Cost" }
  ];


  function SimpleAccordionItem({ faq, index, openFaq, setOpenFaq }: { faq: { question: string; answer: string }; index: number; openFaq: number | null; setOpenFaq: React.Dispatch<React.SetStateAction<number | null>> }) {
    const isOpen = openFaq === index;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
      >
        <motion.button
          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpenFaq(isOpen ? null : index)}
          className="w-full px-6 py-4 text-left flex items-center justify-between transition-colors duration-200"
        >
          <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-white/60" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: "auto", 
                opacity: 1,
                transition: {
                  height: { duration: 0.4, ease: "easeInOut" },
                  opacity: { duration: 0.3, ease: "easeOut", delay: 0.1 }
                }
              }}
              exit={{ 
                height: 0, 
                opacity: 0,
                transition: {
                  height: { duration: 0.5, ease: "easeInOut" },
                  opacity: { duration: 0.4, ease: "easeOut" }
                }
              }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-4">
                <p className="text-white/70 leading-relaxed">{faq.answer}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative flex flex-col">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-4"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-white/80 text-sm font-medium">The Ultimate QR Code Solution</span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight"
              >
                QR Genius Pro
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed"
              >
                Create stunning, customizable QR codes and scan them instantly. 
                The professional toolkit for businesses, creators, and developers.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
              >
                <motion.a
                  href="/qr"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-2xl text-lg flex items-center justify-center gap-3"
                >
                  <QrCode className="w-5 h-5" />
                  Generate QR Code
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.a>

                <motion.a
                  href="/scan"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-2xl text-lg flex items-center justify-center gap-3"
                >
                  <Camera className="w-5 h-5" />
                  Scan QR Code
                </motion.a>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-2xl mx-auto"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                    <div className="text-white/60 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Everything you need to create, customize, and manage QR codes like a professional.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60">{feature.description}</p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-white/60">
                Get answers to the most common questions about QR Genius Pro.
              </p>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <SimpleAccordionItem
                  key={index}
                  faq={faq}
                  index={index}
                  openFaq={openFaq}
                  setOpenFaq={setOpenFaq}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-12 border border-white/10"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-white/60 mb-8">
                Join thousands of users who trust QR Genius Pro for their QR code needs.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex gap-4"
              >
                <a
                  href="/qr"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-2xl text-lg"
                >
                  Start Generating Now
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <SleekFooter />
      </div>
    </div>
  );
}