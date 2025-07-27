import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid or expired reset token",
        variant: "destructive",
      });
      setError("Invalid or expired reset token");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.resetPassword({
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      if (response.success) {
        toast({
          title: "Success",
          description: "Your password has been reset successfully",
        });
        navigate("/login");
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to reset password");
      toast({
        title: "Error",
        description: err?.response?.data?.message || err.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-red-600">Invalid Reset Link</CardTitle>
            <CardDescription className="text-center">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/forgot-password")} className="btn-orange">
              Request New Reset Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reset Your Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your new password below
          </p>
        </div>
        {/* Form */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
              Create New Password
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Make sure it's secure and easy to remember
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="h-12 text-lg"
                  disabled={isLoading}
                  minLength={8}
                  aria-label="New Password"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-12 text-lg"
                  disabled={isLoading}
                  minLength={8}
                  aria-label="Confirm New Password"
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
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
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

export default ResetPassword;