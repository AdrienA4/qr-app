'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function MinimalFooter() {
  return (
    <footer className="py-6 px-4 w-full">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-4"
        >
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-gray-400 text-sm">Built with</span>
            <motion.div whileHover={{ scale: 1.2 }}>
              <Image
                src="/nextjs.png"
                alt="Next.js"
                width={30}
                height={26}
                draggable={false}
                className="inline-block"
              />
            </motion.div>
          </motion.div>

          <motion.span 
            className="text-gray-400"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            |
          </motion.span>

          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div whileHover={{ scale: 1.2 }}>
              <Image
                src="/vercel.ico"
                alt="Powered by Vercel"
                width={20}
                height={20}
                draggable={false}
                className="inline-block"
              />
            </motion.div>
            <span className="text-gray-400 text-sm">Powered by Vercel</span>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}