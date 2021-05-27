import React, { useState, useEffect, createRef } from "react";
import CreateAssignment from "./components/CreateAssignment";
import Layout from "./components/Layout";
import UploadScannedExams from "./components/UploadScannedExams";
import {
  createAssignment,
  getAssignment,
  sendExam,
  uploadStatus,
} from "./utils";

function App() {
  const [created, setCreated] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });

  const loop = createRef();

  const clearAlert = () => {
    setAlert({ type: null, message: null });
  };

  const getStatus = async () => {
    try {
      const res = await uploadStatus();
      if (res.ok) {
        const data = await res.json();
        if (data.state === "success") {
          setAlert({
            type: "success",
            message: "The exams have been successfully uploaded!",
          });
          setLoading(false);
          return;
        }
      } else {
        setAlert({
          type: "danger",
          message: "There was an unexpected error, please try again later...",
        });
      }
      loop.current = setTimeout(getStatus, 1000);
    } catch (err) {
      console.log(err);
      setAlert({
        type: "danger",
        message: "There was an unexpected error, please try again later...",
      });
    } finally {
      clearTimeout(loop);
    }
  };

  const onUpload = (e) => {
    clearAlert();
    setLoading(true);

    const sendFile = async (data) => {
      try {
        const res = await sendExam();
        if (res.ok) {
          getStatus();
        } else {
          throw new Error();
        }
      } catch (err) {
        console.log(err);
        setAlert({
          type: "danger",
          message: "There was an unexpected error, please try again later...",
        });
        setLoading(false);
      }
    };

    sendFile();
  };

  const onCreate = async () => {
    try {
      setLoading(true);
      const res = await createAssignment();
      const data = await res.json();
      if (data.assignment) {
        setCreated(true);
      } else {
        throw new Error("Unable to create ");
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      setAlert({
        type: "danger",
        message: "There was an unexpected error, please try again later...",
      });
    }
  };

  const View = () => {
    if (isLoading) {
      return (
        <>
          <p>
            The exams are now being imported to Canvas which can take up to 10
            minutes. You can close this browser window.
          </p>
          <p>
            If you have any questions, or any problem arises, please contact{" "}
            <a href="mailto:it-support@kth.se">it-support@kth.se</a>!
          </p>
          <p>Loading...</p>
        </>
      );
    }

    if (created) {
      return <UploadScannedExams onUpload={onUpload} />;
    }

    return <CreateAssignment onCreate={onCreate} />;
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getAssignment();
        const data = await res.json();
        if (data.assignment) {
          setCreated(true);
        }
        setLoading(false);
      } catch (err) {
        console.log(err);
        setAlert({
          type: "danger",
          message: "There was an unexpected error, please try again later...",
        });
      }
    };
    init();
  }, [setCreated, setLoading, setAlert]);

  return <Layout alert={alert}>{View()}</Layout>;
}

export default App;
