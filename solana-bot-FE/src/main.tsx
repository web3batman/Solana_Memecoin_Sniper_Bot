// import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppContextProvider } from "./context/appContext";
import { SocketProvider } from "./context/socketContext";
import { ToastContainer, Bounce } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AppContextProvider>
    <SocketProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="dark"
        transition={Bounce}
      />
      <App />
    </SocketProvider>
  </AppContextProvider>
);
