import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider, focusManager } from "react-query";
import { ErrorBoundary } from "react-error-boundary";

import "./index.css";
import App from "./App";
import FullPageError from "./components/FullPageError";
import reportWebVitals from "./reportWebVitals";

const queryClient = new QueryClient();
focusManager.setEventListener((handleFocus) => {
  // Listen only to visibillitychange
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("visibilitychange", handleFocus, false);
  }

  return () => {
    // Be sure to unsubscribe if a new handler is set
    window.removeEventListener("visibilitychange", handleFocus);
  };
});

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={FullPageError}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
