import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider, focusManager } from "react-query";
import { ErrorBoundary } from "react-error-boundary";

import "./index.css";
import App from "./App";
import FullPageError from "./components/FullPageError";
import reportWebVitals from "./reportWebVitals";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount, error) {
        if (failureCount > 3 || error?.status === 401) {
          return false;
        }
        return true;
      },
    },
  },
});

// By default, react-query does a request to the backend every time the window
// is focused (i.e. it listens to events "visibilitychange" and "focus")
//
// However, Scanned Exams runs inside an <iframe> so we don't want to perform a
// request when the user clicks outside/inside the <iframe>.
//
// Therefore we have implemented our own "onfocus" handler where we only listen
// to "visibilitychange" events
// Read more: https://react-query.tanstack.com/guides/window-focus-refetching
focusManager.setEventListener((handleFocus) => {
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("visibilitychange", handleFocus, false);
  }

  return () => {
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
