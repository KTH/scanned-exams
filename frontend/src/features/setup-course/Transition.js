import React, { useEffect } from "react";

const TransitionContext = React.createContext();

function useTransition(
  finalState,
  { enter, enterStart, enterEnd, leave, leaveStart, leaveEnd }
) {
  const [initialState, setStartState] = React.useState(finalState);
  const [allClasses, setAllClasses] = React.useState("");

  React.useLayoutEffect(() => {
    let handler;
    if (!initialState && finalState) {
      // Transition off -> on
      setAllClasses([enter, enterStart].join(" "));

      handler = window.requestAnimationFrame(() => {
        setAllClasses([enter, enterEnd].join(" "));
      });
    } else if (initialState && !finalState) {
      // Transition on -> off
      setAllClasses([leave, leaveStart].join(" "));

      handler = window.requestAnimationFrame(() => {
        setAllClasses([leave, leaveEnd].join(" "));
      });
    } else {
      // off -> off
      // on -> on
      setAllClasses("");
    }

    return () => {
      if (handler) {
        window.cancelAnimationFrame(handler);
      }
    };
  }, [
    initialState,
    finalState,

    enter,
    enterStart,
    enterEnd,
    leave,
    leaveStart,
    leaveEnd,
  ]);

  return [initialState, () => setStartState(finalState), allClasses];
}

export function Transition({ children, currentIndex }) {
  return (
    <TransitionContext.Provider value={currentIndex}>
      <div className="relative">{children}</div>
    </TransitionContext.Provider>
  );
}

export function TransitionElement({ index, children }) {
  const currentIndex = React.useContext(TransitionContext);
  const finalState = index === currentIndex;
  const [direction, setDirection] = React.useState("");

  useEffect(() => {
    if (index > currentIndex) {
      setDirection("right");
    } else if (index < currentIndex) {
      setDirection("left");
    }
  }, [index, currentIndex]);

  const [initialState, endTransition, allClasses] = useTransition(finalState, {
    enter: "absolute top-0 w-full -top-4 transition-all transform duration-500",
    enterStart: `${direction === "left" ? "-" : ""}translate-x-36 opacity-0`,
    enterEnd: "translate-x-0 opacity-100",

    leave: "absolute top-0 w-full -top-4 transition-all transform duration-500",
    leaveStart: "translate-x-0 opacity-100",
    leaveEnd: `${direction === "left" ? "-" : ""}translate-x-36 opacity-0`,
  });

  return (
    <>
      {(finalState || initialState) && (
        <div onTransitionEnd={endTransition} className={allClasses}>
          {children}
        </div>
      )}
    </>
  );
}
