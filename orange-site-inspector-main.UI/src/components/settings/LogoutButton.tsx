import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { logout } = useAuth();
  return (
    <Card className="card-luxury">
      <CardContent className="pt-6">
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
} 