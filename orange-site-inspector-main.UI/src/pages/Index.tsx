
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page
    navigate("/login");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="w-20 h-20 bg-orange-gradient rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
          <span className="text-white text-2xl font-bold">OE</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loading Orange Egypt...</h1>
      </div>
    </div>
  );
};

export default Index;
