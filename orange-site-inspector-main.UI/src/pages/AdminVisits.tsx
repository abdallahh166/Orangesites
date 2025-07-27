import { useEffect, useState } from "react";
import { apiClient, Visit, VisitStatus } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVisits();
  }, []);

  async function fetchVisits() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getPendingVisits();
      if (!res.success) throw new Error(res.message);
      setVisits(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load visits");
    } finally {
      setLoading(false);
    }
  }

  const filtered = visits.filter(v =>
    (!search || v.siteName?.toLowerCase().includes(search.toLowerCase()) || v.userName?.toLowerCase().includes(search.toLowerCase())) &&
    (!status || v.status === status)
  );

  async function handleAction(action: string, visit: Visit) {
    setActionLoading(true);
    try {
      if (action === "approve") {
        await apiClient.acceptVisit(visit.id);
        toast({ title: "Visit Approved", description: `Visit for ${visit.siteName} has been approved.` });
      } else if (action === "reject") {
        await apiClient.rejectVisit(visit.id);
        toast({ title: "Visit Rejected", description: `Visit for ${visit.siteName} has been rejected.` });
      }
      await fetchVisits();
      setSelectedVisit(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Action failed", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Visit Management</h1>
        <div className="flex gap-2">
          <Input placeholder="Search visits..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="border rounded px-2 py-1" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
            <option value="InProgress">In Progress</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin h-8 w-8 text-orange-500" /></div>
      ) : error ? (
        <div className="text-center text-red-600 py-10">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(visit => (
            <Card key={visit.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{visit.siteName} ({visit.siteCode})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">By {visit.userName}</div>
                <div className="text-xs text-gray-500">Status: {visit.status}</div>
                <div className="text-xs text-gray-500">Created: {new Date(visit.createdAt).toLocaleDateString('en-GB')}</div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleAction("approve", visit)} disabled={actionLoading}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => handleAction("reject", visit)} disabled={actionLoading}>Reject</Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedVisit(visit)}>View</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Visit Details Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setSelectedVisit(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setSelectedVisit(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-2">Visit Details</h2>
            <div className="mb-2"><span className="font-semibold">Site:</span> {selectedVisit.siteName} ({selectedVisit.siteCode})</div>
            <div className="mb-2"><span className="font-semibold">User:</span> {selectedVisit.userName}</div>
            <div className="mb-2"><span className="font-semibold">Status:</span> {selectedVisit.status}</div>
            <div className="mb-2"><span className="font-semibold">Created:</span> {new Date(selectedVisit.createdAt).toLocaleDateString('en-GB')}</div>
            <div className="mb-2"><span className="font-semibold">Priority:</span> {selectedVisit.priority}</div>
            <div className="mb-2"><span className="font-semibold">Type:</span> {selectedVisit.type}</div>
            <div className="mb-2"><span className="font-semibold">Notes:</span> {selectedVisit.notes || 'None'}</div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => handleAction("approve", selectedVisit)} disabled={actionLoading}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => handleAction("reject", selectedVisit)} disabled={actionLoading}>Reject</Button>
              <Button size="sm" variant="destructive" onClick={() => setSelectedVisit(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 