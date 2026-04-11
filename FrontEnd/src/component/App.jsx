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

const App = () => {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
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
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
