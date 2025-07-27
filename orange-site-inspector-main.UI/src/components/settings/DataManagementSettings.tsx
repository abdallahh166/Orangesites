import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function DataManagementSettings() {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleExport = () => {
    // Placeholder: Implement export logic if API available
    alert("Export Data feature coming soon.");
  };
  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start" onClick={handleExport}>Export Data</Button>
        <Button variant="outline" className="w-full justify-start" onClick={handleClearCache}>Clear Cache</Button>
        <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20" onClick={() => setDeleteOpen(true)}>Delete Account</Button>
      </CardContent>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="destructive" onClick={() => { setDeleteOpen(false); alert("Delete Account feature coming soon."); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 