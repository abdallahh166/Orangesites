import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { API_BASE_URL } from '@/config/env';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Check API connectivity on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
          setApiStatus('Connected');
        } else {
          setApiStatus('Server error');
        }
      } catch (error) {
        console.error('API health check failed:', error);
        setApiStatus('Connection failed');
      }
    };
    
    checkApiHealth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Login attempt started for:', email);
      await login(email, password, rememberMe);
      console.log('Login successful, navigating to dashboard');
      navigate("/dashboard");
    } catch (err: any) {
      console.error('Login error in component:', err);
      const errorMessage = err?.message || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRememberMeChange = (checked: boolean | "indeterminate") => {
    setRememberMe(checked === true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-orange-gradient rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">OE</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to Orange Egypt Site Inspection</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="card-luxury">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">Sign In</CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="engineer@orange.eg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-lg"
                  disabled={isLoading}
                  aria-label="Email Address"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-lg"
                  disabled={isLoading}
                  aria-label="Password"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center" role="alert">{error}</div>
              )}

              {apiStatus && (
                <div className={`text-sm text-center ${
                  apiStatus === 'Connected' ? 'text-green-600' : 'text-red-600'
                }`} role="status">
                  API Status: {apiStatus}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={handleRememberMeChange}
                    disabled={isLoading}
                    aria-label="Remember me"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg btn-orange"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link to="/signup" className="text-orange-600 hover:text-orange-700 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          © 2024 Orange Egypt. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
