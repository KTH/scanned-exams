import React from "react";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

async function getUserData() {
  const response = await window.fetch("/scanned-exams/api/me");

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
}

function App2() {
  const query = useQuery("user", getUserData);

  if (query.isLoading) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    throw query.error;
  }

  if (query.data) {
    return <div>You are logged in</div>;
  }

  return <div>You are not logged in</div>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto">
        <App2 />
      </div>
    </QueryClientProvider>
  );
}
