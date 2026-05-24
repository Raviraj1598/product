import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  mergeStoreSettings,
  resolveHomepageSpotlightSlides,
  type ResolvedSpotlightSlide,
  type StoreSettings,
} from '@boutique/shared';
import type { Category } from '@boutique/shared';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '../ui/carousel';
import { cn } from '../ui/utils';

type Props = {
  settings: StoreSettings;
  categories: Category[];
};

function SpotlightSlide({ slide }: { slide: ResolvedSpotlightSlide }) {
  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
      <div className="order-2 md:order-1 min-w-0">
        <span className="inline-block px-3 py-1 text-[11px] font-medium uppercase tracking-wider bg-[var(--luxury-gold)]/20 text-[var(--luxury-maroon)] rounded-full mb-3">
          {slide.subtitle}
        </span>
        <h3 className="text-2xl md:text-3xl font-semibold text-[var(--luxury-maroon)] mb-3 leading-tight tracking-tight">
          {slide.title}
        </h3>
        <p className="text-sm text-gray-600 mb-5 leading-relaxed line-clamp-4">{slide.description}</p>
        <Link
          to={slide.shopHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-[var(--luxury-maroon)] text-white rounded-full hover:bg-[var(--luxury-red)] transition-colors font-medium"
        >
          {slide.buttonLabel}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
      <div className="order-1 md:order-2 relative rounded-2xl overflow-hidden shadow-lg aspect-[16/10] md:aspect-auto md:h-64 lg:h-72">
        <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

export function FashionCollectionSpotlight({ settings, categories }: Props) {
  const merged = mergeStoreSettings(settings);
  const spotlight = merged.homepageCollectionSpotlight;
  const slides = resolveHomepageSpotlightSlides(spotlight, categories);

  const [api, setApi] = useState<CarouselApi>();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActive(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || slides.length < 2) return;
    const sec = spotlight.autoplaySeconds;
    if (!sec || sec <= 0) return;
    const id = window.setInterval(() => api.scrollNext(), sec * 1000);
    return () => window.clearInterval(id);
  }, [api, slides.length, spotlight.autoplaySeconds]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  if (!spotlight.enabled || slides.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-white border-t border-black/[0.04]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          {spotlight.eyebrow?.trim() && (
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--luxury-gold)] font-semibold mb-2">
              {spotlight.eyebrow}
            </p>
          )}
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--luxury-maroon)] tracking-tight">
            {spotlight.title}
          </h2>
          {spotlight.description?.trim() && (
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{spotlight.description}</p>
          )}
        </div>

        <div className="relative px-10 sm:px-12">
          <Carousel
            setApi={setApi}
            opts={{ loop: slides.length > 1, align: 'start' }}
            className="w-full"
          >
            <CarouselContent>
              {slides.map((slide) => (
                <CarouselItem key={slide.id}>
                  <SpotlightSlide slide={slide} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-700 hover:border-[var(--luxury-maroon)] hover:text-[var(--luxury-maroon)] transition-colors"
                aria-label="Previous collection"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => api?.scrollNext()}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-700 hover:border-[var(--luxury-maroon)] hover:text-[var(--luxury-maroon)] transition-colors"
                aria-label="Next collection"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="flex justify-center gap-2 mt-6">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollTo(i)}
                    aria-label={`Go to ${s.title}`}
                    aria-current={i === active ? 'true' : undefined}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      i === active
                        ? 'w-6 bg-[var(--luxury-maroon)]'
                        : 'w-2 bg-gray-300 hover:bg-gray-400',
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
