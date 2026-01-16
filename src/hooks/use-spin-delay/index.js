import { useEffect, useRef, useState } from "react";

export const defaultOptions = {
  delay: 500,
  minDuration: 200,
  ssr: true,
};

function useIsSSR() {
  return typeof window === "undefined";
}

export function useSpinDelay(loading, options) {
  const { delay, minDuration, ssr } = { ...defaultOptions, ...options };

  const isSSR = useIsSSR() && ssr;
  const timeout = useRef(null);

  const [state, setState] = useState(() => {
    return isSSR && loading ? "DISPLAY" : "IDLE";
  });

  // Handle synchronous transitions during render
  if (loading && state === "IDLE" && !isSSR) {
    setState("DELAY");
  }

  if (!loading && state !== "IDLE" && state !== "DISPLAY") {
    setState("IDLE");
  }

  // Handle timers only
  useEffect(() => {
    if (state !== "DELAY") return;

    timeout.current = setTimeout(
      () => {
        setState("DISPLAY");

        timeout.current = setTimeout(() => {
          setState("EXPIRE");
        }, minDuration);
      },
      isSSR ? 0 : delay
    );

    return () => clearTimeout(timeout.current);
  }, [state, delay, minDuration, isSSR]);

  return state === "DISPLAY" || state === "EXPIRE";
}
