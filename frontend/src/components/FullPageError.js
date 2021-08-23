import React from "react";

export default function FullPageError({ error }) {
  return (
    <div role="alert" className="bg-red-100 p-12">
      {error.message}
    </div>
  );
}
