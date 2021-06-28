import { useEffect, useState } from 'react';

export function useDelayedRender(
  delay: number,
  showLoading: boolean,
): (fn: any) => any {
  const [delayed, setDelayed] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setDelayed(false), delay);
    return () => {
      setDelayed(true);
      clearTimeout(timeout);
    };
    // Need 'showLoading' to reset 'delayed' after showing the loader
  }, [showLoading]);

  return fn => showLoading && !delayed && fn();
}
