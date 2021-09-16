import { useEffect, useRef } from "react";

/**
 * Perform an action at intervals for the lifespan of the component
 * @param {*} callback - called each interval
 * @param {*} delay - interval in ms
 * Source: https://usehooks-typescript.com/react-hook/use-interval
 */
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    if (delay === null) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);

    // eslint-disable-next-line consistent-return
    return () => clearInterval(id);
  }, [delay]);
}

// eslint-disable-next-line import/prefer-default-export
export { useInterval };
