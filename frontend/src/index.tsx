import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider, focusManager } from "react-query";
import { ErrorBoundary } from "react-error-boundary";

import App from "./App";
import FullPageError from "./common/FullPageError";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount: number, error: any) {
        if (failureCount > 3 || error?.statusCode === 401) {
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
focusManager.setEventListener((handleFocus: any) => {
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
