import React from "react";

function UploadScannedExams() {
  const onUpload = () => {};
  return (
    <div>
      <h1>Upload scanned exams</h1>
      <button onClick={onUpload} type="file">
        Upload
      </button>
    </div>
  );
}

export default UploadScannedExams;
