import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/api";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: UserRole.Engineer as UserRole,
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string>("");
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError("");
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await register({
        userName: formData.email.split('@')[0],
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate("/dashboard");
    } catch (error: any) {
      // Parse backend errors for field-level display
      const errorList = error?.response?.data?.errors || error?.errors;
      const errorMsg = error?.response?.data?.message || error?.message || "Registration failed";
      const fieldMap: { [key: string]: string } = {
        email: "email",
        username: "userName",
        "user name": "userName",
        password: "password",
        name: "firstName",
        "full name": "firstName",
        role: "role"
      };
      let mapped: { [key: string]: string } = {};
      let general: string[] = [];
      let passwordErrors: string[] = [];
      if (Array.isArray(errorList)) {
        errorList.forEach((err: string) => {
          let found = false;
          for (const key in fieldMap) {
            if (err.toLowerCase().includes(key)) {
              if (fieldMap[key] === "password") {
                passwordErrors.push(err);
              } else {
                mapped[fieldMap[key]] = err;
              }
              found = true;
              break;
            }
          }
          if (!found) general.push(err);
        });
      }
      if (passwordErrors.length > 0) {
        mapped.password = passwordErrors[0]; // Show first password error under field
        // Show all password errors in toast
        toast({
          title: "Password Requirements",
          description: (
            <ul className="mt-2 list-disc list-inside text-left text-sm text-red-600 dark:text-red-400">
              {passwordErrors.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          ),
          variant: "destructive",
        });
      } else if (general.length > 0) {
        setGeneralError(general.join(" | "));
      } else {
        setGeneralError(errorMsg);
      }
      setFieldErrors(mapped);
    } finally {
      setIsLoading(false);
    }
  };

  // Password policy requirements
  const passwordRequirements = [
    { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
    { label: "At least one uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
    { label: "At least one lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
    { label: "At least one number", test: (pw: string) => /[0-9]/.test(pw) },
    { label: "At least one special character", test: (pw: string) => /[^a-zA-Z0-9]/.test(pw) },
    { label: "Not a common password (e.g. 'password', '123456')", test: (pw: string) => !["password","123456","qwerty","admin","user","test"].includes(pw.toLowerCase()) },
  ];

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join Orange Egypt</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Create your Site Inspection account</p>
          </div>
        </div>

        {/* Signup Form */}
        <Card className="card-luxury">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">Create Account</CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generalError && (
              <div className="mb-4 text-sm text-red-600 dark:text-red-400 text-center font-medium">
                {generalError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                    className="h-11"
                    disabled={isLoading}
                  />
                  {fieldErrors.firstName && <div className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.firstName}</div>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                    className="h-11"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="engineer@orange.eg"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="h-11"
                  disabled={isLoading}
                />
                {fieldErrors.email && <div className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.email}</div>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value as UserRole)}
                  disabled={isLoading}
                  aria-label="Select your role"
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.Engineer}>Engineer</SelectItem>
                    <SelectItem value={UserRole.Admin}>Admin</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.role && <div className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.role}</div>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  className="h-11"
                  disabled={isLoading}
                />
                <ul className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {passwordRequirements.map((req, idx) => (
                    <li key={idx} className={req.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
                      <span className="inline-block w-3">{req.test(formData.password) ? "✓" : "•"}</span> {req.label}
                    </li>
                  ))}
                </ul>
                {fieldErrors.password && <div className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.password}</div>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  I agree to the{" "}
                  <Link to="/terms" className="text-orange-600 hover:text-orange-700">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-orange-600 hover:text-orange-700">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg btn-orange"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
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

export default Signup;
