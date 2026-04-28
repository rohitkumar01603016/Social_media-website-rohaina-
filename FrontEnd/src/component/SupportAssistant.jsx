import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import auth from "../auth/auth-help";

const SupportAssistant = () => {
  const jwt = auth.isAuthenticated();
  const location = useLocation();
  const navigate = useNavigate();

  if (!jwt?.token || location.pathname === "/support") {
    return null;
  }

  return (
    <div className="support-assistant">
      <button
        type="button"
        className="support-assistant-toggle"
        onClick={() => navigate("/support")}
      >
        <span className="support-assistant-toggle-icon">
          <i className="fa-solid fa-life-ring" />
        </span>
        <span className="support-assistant-toggle-copy">
          <strong>Support</strong>
          <span>Open chat</span>
        </span>
      </button>
    </div>
  );
};

export default SupportAssistant;
