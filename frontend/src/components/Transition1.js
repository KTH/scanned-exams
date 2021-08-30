import React from "react";

const TransitionContext = React.createContext();

export function Transition({ children, currentIndex }) {
  return (
    <TransitionContext.Provider value={currentIndex}>
      <div className="relative">{children}</div>
    </TransitionContext.Provider>
  );
}

export function TransitionElement({ index, children }) {
  const currentIndex = React.useContext(TransitionContext);
  const endState = index === currentIndex;
  const [startState, setStartState] = React.useState(currentIndex === index);
  const [allClasses, setAllClasses] = React.useState("");

  const enter = "absolute top-0 w-full -mt-4 transition-opacity duration-1000";
  const enterStart = "opacity-0";
  const enterEnd = "opacity-100";

  const leave = "absolute top-0 w-full -mt-4 transition-opacity duration-1000";
  const leaveStart = "opacity-100";
  const leaveEnd = "opacity-0";

  React.useLayoutEffect(() => {
    let handler;
    if (!startState && endState) {
      // Transition off -> on
      setAllClasses([enter, enterStart].join(" "));

      handler = window.requestAnimationFrame(() => {
        setAllClasses([enter, enterEnd].join(" "));
      });
    } else if (startState && !endState) {
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
  }, [startState, endState]);

  return (
    <>
      {(endState || startState) && (
        <div
          onTransitionEnd={() => setStartState(endState)}
          className={allClasses}
        >
          {children}
        </div>
      )}
    </>
  );
}
