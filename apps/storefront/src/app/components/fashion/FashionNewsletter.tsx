import { motion } from 'motion/react';
import { Mail, Gift } from 'lucide-react';

export function FashionNewsletter() {
  return (
    <div className="relative bg-gradient-to-r from-[var(--luxury-maroon)] via-[var(--luxury-red)] to-[var(--luxury-maroon)] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 border-4 border-white transform rotate-45" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--luxury-gold)] rounded-full mb-4">
              <Gift className="w-8 h-8 text-white" aria-hidden />
            </div>
            <h2 className="text-4xl font-semibold mb-4">Join our fashion family</h2>
            <p className="text-white/90 text-lg">Drop your email—we&apos;ll toast you soon (demo form only).</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
          >
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="email"
                placeholder="Enter your email"
                readOnly
                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--luxury-gold)] opacity-95"
              />
            </div>
            <button
              type="button"
              className="px-8 py-4 bg-[var(--luxury-gold)] text-white rounded-full hover:bg-white hover:text-[var(--luxury-maroon)] transition-all shadow-lg"
              onClick={() => {}}
            >
              Subscribe
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-white/70 text-sm mt-4"
          >
            Connect newsletter to your CRM when you&apos;re ready for production.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
