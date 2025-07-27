
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-orange-gradient rounded-2xl mx-auto flex items-center justify-center shadow-lg">
          <span className="text-white text-4xl font-bold">404</span>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Page Not Found</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard">
            <Button className="btn-orange">
              <Home className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
