import { useEffect } from 'react';
import { Decks } from '../types';

export default function useLocalStorage(decks: Decks, sidebarActive: string) {
  useEffect(() => {
    localStorage.setItem('sidebarActive', sidebarActive);
  }, [sidebarActive]);

  useEffect(() => {
    localStorage.setItem('decks', JSON.stringify(decks));
  }, [decks]);
}
