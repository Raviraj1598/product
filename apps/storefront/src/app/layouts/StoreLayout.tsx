import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { applyStoreTheme, mergeStoreSettings, useStore } from '@boutique/shared';
import { FashionHeader } from '../components/fashion/FashionHeader';
import { FashionFooter } from '../components/fashion/FashionFooter';

export default function StoreLayout() {
  const { settings, catalogReady } = useStore();
  const location = useLocation();

  useEffect(() => {
    if (catalogReady && settings.siteName) {
      document.title = settings.siteName;
    }
  }, [catalogReady, settings.siteName]);

  useEffect(() => {
    applyStoreTheme(mergeStoreSettings(settings).theme);
  }, [settings]);

  if (!catalogReady) {
    const name = mergeStoreSettings(settings).siteName;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--boutique-surface)] text-muted-foreground transition-colors duration-500">
        Loading {name}…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--boutique-page-bg)] text-[var(--boutique-foreground)] transition-colors duration-300">
      <FashionHeader />
      <main key={location.pathname} className="boutique-route-enter flex-1">
        <Outlet />
      </main>
      <FashionFooter />
    </div>
  );
}
