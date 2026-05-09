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
          path="/s"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/:id"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/edit/:id"
          element={
            <PrivateRoute>
              <EditProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/join"
          element={
            <PrivateRoute>
              <Join />
            </PrivateRoute>
          }
        />
        <Route
          path="/support"
          element={
            <PrivateRoute>
              <SupportAssistantPage />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="*"
          element={
            <PrivateRoute>
              <NotFoundPage />
            </PrivateRoute>
          }
        />
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
