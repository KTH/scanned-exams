import React, { useState, useEffect } from "react";
import CreateAssignment from "./components/CreateAssignment";
import UploadScannedExams from "./components/UploadScannedExams";
import { createAssignment, getAssignment } from "./utils";
function App() {
  const [created, setCreated] = useState(false);

  useEffect(() => {
    const init = async () => {
      const res = await getAssignment();
      const data = await res.json();
      if (data.assignment) {
        setCreated(true);
      }
    };
    init();
  }, [setCreated]);

  const onCreate = async () => {
    const res = await createAssignment();
    if (res.ok) {
      setCreated(true);
    }
  };

  if (created) {
    return <UploadScannedExams />;
  }

  return <CreateAssignment onCreate={onCreate} />;
}

export default App;
