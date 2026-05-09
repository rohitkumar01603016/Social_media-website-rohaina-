import { Navigate } from "react-router-dom";
import auth from "../auth/auth-help";

function PrivateRoute({ children }) {
  const user = auth.isAuthenticated();

  return user ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;
