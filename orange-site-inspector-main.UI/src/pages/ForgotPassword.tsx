import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.forgotPassword({ email });
      if (response.success) {
        setIsEmailSent(true);
        toast({
          title: "Email Sent",
          description: "Password reset instructions have been sent to your email.",
        });
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to send reset email");
      toast({
        title: "Error",
        description: err?.response?.data?.message || err.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEmailSent ? "Check Your Email" : "Forgot Password"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isEmailSent
                ? "We've sent you instructions to reset your password"
                : "Enter your email to receive password reset instructions"}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="card-luxury">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
              {isEmailSent ? "Next Steps" : "Reset Password"}
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              {isEmailSent
                ? "Check your email for the reset link"
                : "We'll send you instructions to reset your password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isEmailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
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
                {error && (
                  <div className="text-red-600 text-sm text-center" role="alert">{error}</div>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 text-lg btn-orange"
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Instructions"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button
                  onClick={() => setIsEmailSent(false)}
                  variant="outline"
                  className="w-full h-12 text-lg"
                >
                  Try Again
                </Button>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                  Sign in here
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

export default ForgotPassword;