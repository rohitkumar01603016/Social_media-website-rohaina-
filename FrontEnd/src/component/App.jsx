import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import NotFoundPage from "./NotFound";
import Register from "./Register";
import PrivateRoute from "../Routing/PrivateRoute";
import HomePage from "./HomePage";
import { ToastContainer } from "react-toastify";
import Profile from "./Profile";
import EditProfile from "./EditProfile";
import Join from "./Join";
import SupportAssistantPage from "./SupportAssistantPage";
import { ThemeProvider } from "../Context/ThemeProvider";

const AppChrome = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="*"
          element={
            <PrivateRoute>
              <Routes>
                <Route path="/s" element={<HomePage />} />
                <Route path="/user/:id" element={<Profile />} />
                <Route path="/user/edit/:id" element={<EditProfile />} />
                <Route path="/chat/join" element={<Join />} />
                <Route path="/support" element={<SupportAssistantPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <ToastContainer />
      <BrowserRouter>
        <AppChrome />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
