
'use client';

import { useCallback } from 'react';

export const useSound = (soundUrl: string) => {
  const playSound = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio(soundUrl);
        audio.play().catch(error => {
          // Autoplay was prevented.
          console.error("Audio play failed:", error);
        });
      } catch (error) {
        console.error("Failed to play sound:", error);
      }
    }
  }, [soundUrl]);

  return playSound;
};
