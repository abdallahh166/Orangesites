import { useEffect, useState } from "react";
import { apiClient, OramaGroup, OramaItem, CreateOramaGroupRequest, UpdateOramaGroupRequest, CreateOramaItemRequest, UpdateOramaItemRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminOrama() {
  const [groups, setGroups] = useState<OramaGroup[]>([]);
  const [items, setItems] = useState<OramaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: string, data?: any } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrama();
  }, []);

  async function fetchOrama() {
    setLoading(true);
    setError(null);
    try {
      const [groupsRes, itemsRes] = await Promise.all([
        apiClient.getOramaGroups(),
        apiClient.getOramaItems(),
      ]);
      if (!groupsRes.success) throw new Error(groupsRes.message);
      if (!itemsRes.success) throw new Error(itemsRes.message);
      setGroups(groupsRes.data);
      setItems(itemsRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to load Orama data");
    } finally {
      setLoading(false);
    }
  }

  // Group CRUD
  async function handleGroupAction(action: string, group?: OramaGroup, values?: Partial<CreateOramaGroupRequest & UpdateOramaGroupRequest>) {
    setActionLoading(true);
    try {
      if (action === "add") {
        await apiClient.createOramaGroupWithDetails(values as CreateOramaGroupRequest);
        toast({ title: "Group Created", description: `Group '${values?.name}' created.` });
      } else if (action === "edit" && group) {
        await apiClient.updateOramaGroupWithDetails(group.id, values as UpdateOramaGroupRequest);
        toast({ title: "Group Updated", description: `Group '${values?.name || group.name}' updated.` });
      } else if (action === "delete" && group) {
        await apiClient.deleteOramaGroup(group.id);
        toast({ title: "Group Deleted", description: `Group '${group.name}' deleted.` });
      }
      await fetchOrama();
      setModal(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Action failed", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  }

  // Item CRUD
  async function handleItemAction(action: string, item?: OramaItem, values?: Partial<CreateOramaItemRequest & UpdateOramaItemRequest>) {
    setActionLoading(true);
    try {
      if (action === "add") {
        await apiClient.createOramaItemWithDetails(values as CreateOramaItemRequest);
        toast({ title: "Item Created", description: `Item '${values?.name}' created.` });
      } else if (action === "edit" && item) {
        await apiClient.updateOramaItemWithDetails(item.id, values as UpdateOramaItemRequest);
        toast({ title: "Item Updated", description: `Item '${values?.name || item.name}' updated.` });
      } else if (action === "delete" && item) {
        await apiClient.deleteOramaItem(item.id);
        toast({ title: "Item Deleted", description: `Item '${item.name}' deleted.` });
      }
      await fetchOrama();
      setModal(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Action failed", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Orama Management</h1>
        <Button onClick={() => setModal({ type: "add-group" })}>Add Group</Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin h-8 w-8 text-orange-500" /></div>
      ) : error ? (
        <div className="text-center text-red-600 py-10">{error}</div>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-2">Groups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(group => (
                <Card key={group.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">{group.description}</div>
                    <div className="text-xs text-gray-500">Items: {group.itemCount}</div>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setModal({ type: "edit-group", data: group })}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => setModal({ type: "delete-group", data: group })}>Delete</Button>
                      <Button size="sm" variant="outline" onClick={() => setModal({ type: "add-item", data: { groupId: group.id } })}>Add Item</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mt-8 mb-2">Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">{item.description}</div>
                    <div className="text-xs text-gray-500">Group: {item.oramaGroupName}</div>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setModal({ type: "edit-item", data: item })}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => setModal({ type: "delete-item", data: item })}>Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
      {/* Modals for CRUD */}
      {modal && (
        <OramaModal modal={modal} setModal={setModal} groups={groups} onGroupAction={handleGroupAction} onItemAction={handleItemAction} loading={actionLoading} />
      )}
    </div>
  );
}

// Modal component for all CRUD actions
function OramaModal({ modal, setModal, groups, onGroupAction, onItemAction, loading }: any) {
  const [form, setForm] = useState<any>(modal.data || {});
  const isGroup = modal.type.includes("group");
  const isItem = modal.type.includes("item");
  const isEdit = modal.type.startsWith("edit");
  const isDelete = modal.type.startsWith("delete");
  const title =
    modal.type === "add-group" ? "Add Group" :
    modal.type === "edit-group" ? "Edit Group" :
    modal.type === "delete-group" ? "Delete Group" :
    modal.type === "add-item" ? "Add Item" :
    modal.type === "edit-item" ? "Edit Item" :
    modal.type === "delete-item" ? "Delete Item" : "";

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: any) {
    e.preventDefault();
    if (isGroup) {
      if (isEdit) onGroupAction("edit", modal.data, form);
      else onGroupAction("add", undefined, form);
    } else if (isItem) {
      if (isEdit) onItemAction("edit", modal.data, form);
      else onItemAction("add", undefined, { ...form, groupId: form.groupId || modal.data?.groupId });
    }
  }

  function handleDelete() {
    if (isGroup) onGroupAction("delete", modal.data);
    else if (isItem) onItemAction("delete", modal.data);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setModal(null)}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setModal(null)}>&times;</button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {isDelete ? (
          <>
            <p>Are you sure you want to delete <b>{modal.data?.name}</b>?</p>
            <div className="flex gap-2 mt-4">
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>Delete</Button>
              <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Name" value={form.name || ""} onChange={handleChange} required />
            {isGroup && (
              <Input name="description" placeholder="Description" value={form.description || ""} onChange={handleChange} />
            )}
            {isItem && (
              <>
                <Input name="description" placeholder="Description" value={form.description || ""} onChange={handleChange} />
                <select name="groupId" value={form.groupId || modal.data?.groupId || ""} onChange={handleChange} className="border rounded px-2 py-1 w-full">
                  <option value="">Select Group</option>
                  {groups.map((g: OramaGroup) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </>
            )}
            <div className="flex gap-2 mt-4">
              <Button type="submit" disabled={loading}>{isEdit ? "Update" : "Create"}</Button>
              <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 