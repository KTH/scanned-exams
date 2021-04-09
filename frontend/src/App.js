import React, { useState, useEffect } from "react";
import CreateAssignment from "./components/CreateAssignment";
import UploadScannedExams from "./components/UploadScannedExams";
import { createAssignment, getAssignment } from "./utils";
function App() {
  const [created, setCreated] = useState(false);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const res = await getAssignment();
      const data = await res.json();
      if (data.assignment) {
        setCreated(true);
      }
      setLoading(false);
    };
    init();
  }, [setCreated, setLoading]);

  const onCreate = async () => {
    setLoading(true);
    const res = await createAssignment();
    const data = await res.json();
    if (data.assignment) {
      setCreated(true);
    }
    setLoading(false);
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (created) {
    return <UploadScannedExams />;
  }

  return <CreateAssignment onCreate={onCreate} />;
}

export default App;
