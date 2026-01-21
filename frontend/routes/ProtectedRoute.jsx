import { Navigate } from "react-router-dom";
import { useAuth } from "../src/context/useAuth";
import { ThreeDot } from "react-loading-indicators";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      {/* Loading */}
      <ThreeDot color="#0c95ff" size="medium" text="" textColor="" />
    </div>
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
