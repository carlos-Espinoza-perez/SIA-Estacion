import { useState, useEffect, useCallback } from 'react';

export interface NavItemRef {
  path: string;
  label: string;
}

const FAVORITES_KEY = 'sia_favoritos';
const RECENTS_KEY = 'sia_recientes';
const STORAGE_EVENT = 'sia_nav_storage_change';

const DEFAULT_FAVORITES: NavItemRef[] = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/accesos', label: 'Accesos' },
];

const DEFAULT_RECENTS: NavItemRef[] = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/operaciones', label: 'Operaciones' },
  { path: '/items', label: 'Ítems' },
];

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
  }
}

export const navigationStorageService = {
  getFavorites(): NavItemRef[] {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      if (!data) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(DEFAULT_FAVORITES));
        return DEFAULT_FAVORITES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_FAVORITES;
    }
  },

  isFavorite(path: string): boolean {
    const list = this.getFavorites();
    return list.some((item) => item.path === path);
  },

  toggleFavorite(item: NavItemRef): boolean {
    const list = this.getFavorites();
    const exists = list.some((i) => i.path === item.path);
    let updated: NavItemRef[];
    if (exists) {
      updated = list.filter((i) => i.path !== item.path);
    } else {
      updated = [...list, item];
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    notifyChange();
    return !exists;
  },

  removeFavorite(path: string): void {
    const list = this.getFavorites();
    const updated = list.filter((i) => i.path !== path);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    notifyChange();
  },

  getRecents(): NavItemRef[] {
    try {
      const data = localStorage.getItem(RECENTS_KEY);
      if (!data) {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(DEFAULT_RECENTS));
        return DEFAULT_RECENTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_RECENTS;
    }
  },

  addRecent(item: NavItemRef): void {
    if (!item.path || item.path === '/' || item.path === '/login') return;
    const list = this.getRecents();
    // Remover si ya existe para moverlo al inicio
    const filtered = list.filter((i) => i.path !== item.path);
    const updated = [item, ...filtered].slice(0, 6); // Max 6 recientes
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
    notifyChange();
  },
};

/**
 * Hook reactivo para sincronizar favoritos y recientes en componentes
 */
export function useNavStorage() {
  const [favorites, setFavorites] = useState<NavItemRef[]>(() =>
    navigationStorageService.getFavorites()
  );
  const [recents, setRecents] = useState<NavItemRef[]>(() =>
    navigationStorageService.getRecents()
  );

  useEffect(() => {
    const handleUpdate = () => {
      setFavorites(navigationStorageService.getFavorites());
      setRecents(navigationStorageService.getRecents());
    };

    window.addEventListener(STORAGE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(STORAGE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isFavorite = useCallback(
    (path: string) => favorites.some((f) => f.path === path),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (item: NavItemRef) => navigationStorageService.toggleFavorite(item),
    []
  );

  const removeFavorite = useCallback(
    (path: string) => navigationStorageService.removeFavorite(path),
    []
  );

  const addRecent = useCallback(
    (item: NavItemRef) => navigationStorageService.addRecent(item),
    []
  );

  return {
    favorites,
    recents,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    addRecent,
  };
}
