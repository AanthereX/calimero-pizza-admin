import React, { useEffect } from "react";
import "./App.css";
import useAuth from "./hooks/useAuth.js";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
  const { setAuth } = useAuth();
  useEffect(() => {
    setAuth({
      user: JSON.parse(localStorage.getItem("user")),
    });
  }, []);
  return (
    <React.Fragment>
      <div className="App">
        <AppRoutes />
      </div>
      <ToastContainer position="top-right" />
    </React.Fragment>
  );
}

export default App;
