import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  createRef,
} from "react";
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

  const clearAlert = useCallback(() => {
    setAlert({ type: null, message: null });
  }, [setAlert]);

  const getStatus = useCallback(async () => {
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
  }, [loop, setLoading, setAlert]);

  const onUpload = (e) => {
    clearAlert();
    setLoading(true);
      const data = new FormData();
      data.append("file", e.target.files[0]);

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

  const onCreate = useCallback(async () => {
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
  }, []);

  const View = useMemo(() => {
    if (isLoading) {
      return <p>Loading...</p>;
    }

    if (created) {
      return <UploadScannedExams onUpload={onUpload} />;
    }

    return <CreateAssignment onCreate={onCreate} />;
  }, [created, isLoading, onCreate, onUpload]);

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

  return <Layout alert={alert}>{View}</Layout>;
}

export default App;
