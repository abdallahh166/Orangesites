import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

export function SecuritySettings() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      await apiClient.changePassword(form);
      toast({ title: "Password Changed", description: "Your password has been changed." });
      setOpen(false);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast({ title: "Change Failed", description: err.message || "Failed to change password.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle>Security</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start" onClick={() => setOpen(true)}>Change Password</Button>
        <Button variant="outline" className="w-full justify-start" disabled>Two-Factor Authentication (Coming Soon)</Button>
        <Button variant="outline" className="w-full justify-start" disabled>Login History (Coming Soon)</Button>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input type="password" placeholder="Current Password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} />
            <Input type="password" placeholder="New Password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} />
            <Input type="password" placeholder="Confirm New Password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button onClick={handleChangePassword} disabled={loading}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 