import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { adminSiteHref } from '../../lib/externalUrls';

export function FashionTailoringCta() {
  return (
    <section className="py-20 bg-gradient-to-br from-[var(--luxury-cream)] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[var(--luxury-maroon)] to-[var(--luxury-red)] rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-12 lg:p-16 text-white flex flex-col justify-center"
            >
              <div className="inline-block px-4 py-2 bg-white/20 rounded-full mb-6 self-start">
                <Sparkles className="w-5 h-5 inline mr-2 align-text-bottom" aria-hidden />
                Alterations concierge
              </div>
              <h2 className="text-4xl md:text-5xl mb-6 leading-tight font-bold">Tailored to perfection</h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Prefer a stitched fit? Reach out via admin contact flow or book a stylist—inventory and sizing still
                come from your live product catalog on the `/shop` page.
              </p>
              <div className="space-y-4 mb-8">
                {['Measurements & consultations', 'Fabric & motif guidance', '7–14 day turnaround estimate'].map(
                  (label) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[var(--luxury-gold)] rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span>{label}</span>
                    </div>
                  ),
                )}
              </div>
              <a
                href={adminSiteHref('/')}
                className="inline-block px-8 py-4 bg-white text-[var(--luxury-maroon)] rounded-full hover:bg-[var(--luxury-gold)] hover:text-white transition-all shadow-xl self-start text-center font-medium"
              >
                Configure in admin
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-full min-h-[400px] lg:min-h-0"
            >
              <img
                src="https://images.unsplash.com/photo-1760287364328-e30221615f2e?w=1080&q=80&fit=max"
                alt="Boutique styling"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
