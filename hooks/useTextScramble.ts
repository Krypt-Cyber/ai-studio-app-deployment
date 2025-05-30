
import { useState, useEffect, useRef, useCallback } from 'react';

// Characters to use during the scramble animation
const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#_";

interface UseTextScrambleOptions {
  play: boolean; // True to start the animation
  speed?: number; // Interval speed for updating characters (ms)
  scrambleDuration?: number; // Total time for the pure scramble effect (ms)
  revealDelay?: number; // Delay before the animation starts for this specific text (ms)
  onAnimationComplete?: () => void; // Callback when animation finishes
}

const generateInitialScramble = (length: number): string => {
  if (length <= 0) return '';
  let scramble = '';
  for (let i = 0; i < length; i++) {
    scramble += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
  }
  return scramble;
};

export const useTextScramble = (
  originalText?: string, // MODIFIED: Made originalText optional
  options: UseTextScrambleOptions
) => {
  const {
    play,
    speed = 50,
    scrambleDuration = 200,
    revealDelay = 0,
    onAnimationComplete,
  } = options;

  const textToUse = originalText ?? ''; // Ensure textToUse is always a string

  const [displayedText, setDisplayedText] = useState<string>(textToUse);

  const frameRequestRef = useRef<number>();
  const lastUpdateTimeRef = useRef(0); 
  const scrambleEndTimeRef = useRef<number>(0); // When pure scrambling should end
  const actualRevealStartTimeRef = useRef<number>(0); // When this item's animation actually starts after delay

  // Ref to track if the animation is considered complete
  const completeRef = useRef(!play); // If not playing initially, it's complete

  // Effect to re-initialize or reset when originalText or play status changes
  useEffect(() => {
    const currentTextForAnimation = originalText ?? ''; // Use coalesced value consistently

    if (!play) {
      setDisplayedText(currentTextForAnimation);
      completeRef.current = true;
    } else {
      const initialScrambledText = generateInitialScramble(currentTextForAnimation.length);
      setDisplayedText(initialScrambledText); 
      completeRef.current = false;
      lastUpdateTimeRef.current = 0; // Reset time tracking
      
      const delayTimer = setTimeout(() => {
        actualRevealStartTimeRef.current = performance.now();
        scrambleEndTimeRef.current = actualRevealStartTimeRef.current + scrambleDuration;
        
        const animate = (currentTime: number) => {
          if (!lastUpdateTimeRef.current) {
            lastUpdateTimeRef.current = currentTime;
          }
          const deltaTime = currentTime - lastUpdateTimeRef.current;

          if (deltaTime >= speed) {
            lastUpdateTimeRef.current = currentTime;
            
            setDisplayedText(prev => {
              if (completeRef.current) return prev;

              let nextText = '';
              let allCharsRevealed = true;

              for (let i = 0; i < currentTextForAnimation.length; i++) {
                const charRevealTime = actualRevealStartTimeRef.current + 
                                     ((scrambleDuration + (currentTextForAnimation.length * speed)) / currentTextForAnimation.length) * i;

                if (currentTime >= charRevealTime) {
                  nextText += currentTextForAnimation[i];
                } else if (currentTime < scrambleEndTimeRef.current && currentTime >= actualRevealStartTimeRef.current) {
                  nextText += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                  allCharsRevealed = false;
                } else {
                  nextText += prev[i] === currentTextForAnimation[i] ? currentTextForAnimation[i] : (prev[i] || SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]);
                  if (prev[i] !== currentTextForAnimation[i]) allCharsRevealed = false;
                }
              }
              
              if (allCharsRevealed) {
                completeRef.current = true;
                if (onAnimationComplete) {
                  onAnimationComplete();
                }
                return currentTextForAnimation; 
              }
              return nextText;
            });
          }

          if (!completeRef.current) {
            frameRequestRef.current = requestAnimationFrame(animate);
          }
        };
        frameRequestRef.current = requestAnimationFrame(animate);

      }, revealDelay);

      return () => {
        clearTimeout(delayTimer);
        if (frameRequestRef.current) {
          cancelAnimationFrame(frameRequestRef.current);
        }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, originalText, speed, scrambleDuration, revealDelay]); // onAnimationComplete excluded 

  return displayedText;
};
