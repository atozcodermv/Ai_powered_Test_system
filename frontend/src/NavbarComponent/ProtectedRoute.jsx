import { Navigate, useLocation } from "react-router-dom";
import {
  clearAuthSession,
  getActiveAuthSession,
  isAuthenticatedForRoles,
  roleNames,
} from "../utils/authSession";

const ProtectedRoute = ({ children, roles = roleNames }) => {
  const location = useLocation();

  if (!isAuthenticatedForRoles(roles)) {
    if (getActiveAuthSession()) {
      return <Navigate to="/home" replace />;
    }

    clearAuthSession();
    return <Navigate to="/user/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
