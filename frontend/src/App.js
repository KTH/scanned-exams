import { useState } from "react";
import CreateAssignment from "./components/CreateAssignment";
import UploadScannedExams from "./components/UploadScannedExams";
function App() {
  const [created, setCreated] = useState(false);
  const onCreate = () => {
    // Api call...
    setCreated(true);
  };

  if (created) {
    return <UploadScannedExams />;
  }

  return <CreateAssignment onCreate={onCreate} />;
}

export default App;
