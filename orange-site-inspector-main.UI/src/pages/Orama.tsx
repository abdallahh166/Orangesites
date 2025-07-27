import { useEffect, useState } from "react";
import { apiClient, OramaGroup, OramaItem, UserRole } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Edit, Trash, BarChart2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { API_BASE_URL } from '../config/env';

interface GroupFormValues {
  name: string;
  description?: string;
  priority: number;
  isActive: boolean;
  isDefault: boolean;
}

interface ItemFormValues {
  name: string;
  description?: string;
  oramaGroupId: number;
  isActive: boolean;
  isRequired: boolean;
  isCritical: boolean;
  priority: number;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  location?: string;
  maintenanceFrequency?: string;
  expectedLifespanYears?: number;
  maintenanceNotes?: string;
}

const Orama = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === UserRole.Admin;
  const [groups, setGroups] = useState<OramaGroup[]>([]);
  const [itemsByGroup, setItemsByGroup] = useState<Record<number, OramaItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<OramaGroup | null>(null);
  const [editingItem, setEditingItem] = useState<OramaItem | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<OramaGroup | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingItem, setDeletingItem] = useState<OramaItem | null>(null);
  const [deleteItemLoading, setDeleteItemLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<GroupFormValues>({
    defaultValues: { name: "", description: "", priority: 1, isActive: true, isDefault: false }
  });

  const editGroupForm = useForm<GroupFormValues>({
    defaultValues: { name: "", description: "", priority: 1, isActive: true, isDefault: false }
  });

  const itemForm = useForm<ItemFormValues>({
    defaultValues: { 
      name: "", 
      description: "", 
      oramaGroupId: 0,
      isActive: true, 
      isRequired: false, 
      isCritical: false, 
      priority: 1,
      model: "",
      manufacturer: "",
      serialNumber: "",
      location: "",
      maintenanceFrequency: "",
      expectedLifespanYears: 0,
      maintenanceNotes: ""
    }
  });

  const editItemForm = useForm<ItemFormValues>({
    defaultValues: { 
      name: "", 
      description: "", 
      oramaGroupId: 0,
      isActive: true, 
      isRequired: false, 
      isCritical: false, 
      priority: 1,
      model: "",
      manufacturer: "",
      serialNumber: "",
      location: "",
      maintenanceFrequency: "",
      expectedLifespanYears: 0,
      maintenanceNotes: ""
    }
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      editGroupForm.reset({
        name: selectedGroup.name,
        description: selectedGroup.description || "",
        priority: selectedGroup.priority,
        isActive: selectedGroup.isActive,
        isDefault: selectedGroup.isDefault,
      });
      itemForm.setValue("oramaGroupId", selectedGroup.id);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (editingItem) {
      editItemForm.reset({
        name: editingItem.name,
        description: editingItem.description || "",
        oramaGroupId: editingItem.oramaGroupId,
        isActive: editingItem.isActive,
        isRequired: editingItem.isRequired,
        isCritical: editingItem.isCritical,
        priority: editingItem.priority,
        model: editingItem.model || "",
        manufacturer: editingItem.manufacturer || "",
        serialNumber: editingItem.serialNumber || "",
        location: editingItem.location || "",
        maintenanceFrequency: editingItem.maintenanceFrequency || "",
        expectedLifespanYears: editingItem.expectedLifespanYears || 0,
        maintenanceNotes: editingItem.maintenanceNotes || ""
      });
    }
  }, [editingItem]);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getOramaGroups();
      if (!res.success) throw new Error(res.message);
      setGroups(res.data);
      // Fetch items for each group
      const itemsResults = await Promise.all(res.data.map(g => apiClient.getOramaItemsByGroup(g.id)));
      const itemsMap: Record<number, OramaItem[]> = {};
      res.data.forEach((g, idx) => {
        itemsMap[g.id] = itemsResults[idx].success ? itemsResults[idx].data : [];
      });
      setItemsByGroup(itemsMap);
    } catch (err: any) {
      setError(err.message || "Failed to load Orama data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (data: GroupFormValues) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orama/groups`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('authToken') || ''}` },
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      toast({ title: "Group Created", description: `Group '${data.name}' created successfully.` });
      setShowGroupForm(false);
      reset();
      fetchGroups();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create group", variant: "destructive" });
    }
  };

  const handleEditGroup = async (data: GroupFormValues) => {
    if (!selectedGroup) return;
    try {
      const res = await fetch(`${API_BASE_URL}/orama/groups/${selectedGroup.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('authToken') || ''}` },
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      toast({ title: "Group Updated", description: `Group '${data.name}' updated successfully.` });
      setShowGroupForm(false);
      setSelectedGroup(null);
      editGroupForm.reset();
      fetchGroups();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update group", variant: "destructive" });
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orama/groups/${groupId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem('authToken') || ''}` },
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      toast({ title: "Group Deleted", description: `Group deleted successfully.` });
      setDeletingGroup(null);
      fetchGroups();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete group", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateItem = async (data: ItemFormValues) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orama/items`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('authToken') || ''}` },
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      toast({ title: "Item Created", description: `Item '${data.name}' created successfully.` });
      setShowItemForm(false);
      itemForm.reset();
      fetchGroups();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create item", variant: "destructive" });
    }
  };

  const handleEditItem = async (data: ItemFormValues) => {
    if (!editingItem) return;
    try {
      const res = await fetch(`${API_BASE_URL}/orama/items/${editingItem.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('authToken') || ''}` },
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      toast({ title: "Item Updated", description: `Item '${data.name}' updated successfully.` });
      setShowItemForm(false);
      setEditingItem(null);
      editItemForm.reset();
      fetchGroups();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update item", variant: "destructive" });
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    setDeleteItemLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orama/items/${itemId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem('authToken') || ''}` },
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      toast({ title: "Item Deleted", description: `Item deleted successfully.` });
      setDeletingItem(null);
      fetchGroups();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete item", variant: "destructive" });
    } finally {
      setDeleteItemLoading(false);
    }
  };

  // Analytics
  const totalItems = Object.values(itemsByGroup).reduce((sum, arr) => sum + arr.length, 0);
  const activeItems = Object.values(itemsByGroup).flat().filter(i => i.isActive).length;
  const requiredItems = Object.values(itemsByGroup).flat().filter(i => i.isRequired).length;
  const criticalItems = Object.values(itemsByGroup).flat().filter(i => i.isCritical).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orama Equipment Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage equipment groups, items, and view analytics</p>
        </div>
        {isAdmin && (
          <Button className="btn-orange" onClick={() => setShowGroupForm(true)}>
            <Plus className="h-5 w-5 mr-2" /> New Group
          </Button>
        )}
      </div>
      {/* Analytics */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5" /> Equipment Analytics</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{groups.length}</div>
            <div className="text-gray-600 dark:text-gray-400">Groups</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</div>
            <div className="text-gray-600 dark:text-gray-400">Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{activeItems}</div>
            <div className="text-gray-600 dark:text-gray-400">Active</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{requiredItems}</div>
            <div className="text-gray-600 dark:text-gray-400">Required</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalItems}</div>
            <div className="text-gray-600 dark:text-gray-400">Critical</div>
          </div>
        </CardContent>
      </Card>
      {/* Groups and Items */}
      {loading ? (
        <div className="text-center py-10">Loading equipment groups...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-10">{error}</div>
      ) : groups.length === 0 ? (
        <div className="text-center py-10">No equipment groups found.</div>
      ) : (
        <div className="space-y-6">
          {groups.map(group => (
            <Card key={group.id} className="card-luxury">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{group.name}</CardTitle>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{group.description}</div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setSelectedGroup(group); setShowGroupForm(true); }}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeletingGroup(group)}><Trash className="h-4 w-4" /></Button>
                    <Button size="sm" onClick={() => { setSelectedGroup(group); setShowItemForm(true); }}><Plus className="h-4 w-4" /> Add Item</Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={group.isActive ? "default" : "secondary"}>{group.isActive ? "Active" : "Inactive"}</Badge>
                  {group.isDefault && <Badge variant="outline">Default</Badge>}
                  <Badge variant="outline">Priority: {group.priority}</Badge>
                  <Badge variant="outline">Items: {group.itemCount}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(itemsByGroup[group.id] || []).map(item => (
                    <Card key={item.id} className="border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                        {isAdmin && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => { setEditingItem(item); setShowItemForm(true); }}><Edit className="h-3 w-3" /></Button>
                            <Button size="sm" variant="destructive" onClick={() => setDeletingItem(item)}><Trash className="h-3 w-3" /></Button>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{item.description}</div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={item.isActive ? "default" : "secondary"}>{item.isActive ? "Active" : "Inactive"}</Badge>
                        {item.isRequired && <Badge variant="outline">Required</Badge>}
                        {item.isCritical && <Badge variant="destructive">Critical</Badge>}
                        <Badge variant="outline">Priority: {item.priority}</Badge>
                        {item.model && <Badge variant="outline">Model: {item.model}</Badge>}
                        {item.manufacturer && <Badge variant="outline">Mfr: {item.manufacturer}</Badge>}
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={showGroupForm} onOpenChange={(open) => { setShowGroupForm(open); if (!open) { setSelectedGroup(null); editGroupForm.reset(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedGroup ? "Edit Group" : "Create New Group"}</DialogTitle>
          </DialogHeader>
          {selectedGroup ? (
            <form onSubmit={editGroupForm.handleSubmit(handleEditGroup)} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" {...editGroupForm.register("name", { required: true })} required />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input id="edit-description" {...editGroupForm.register("description")} />
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Input id="edit-priority" type="number" min={1} max={10} {...editGroupForm.register("priority", { valueAsNumber: true })} required />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...editGroupForm.register("isActive")} /> Active
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...editGroupForm.register("isDefault")} /> Default
                </label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowGroupForm(false); setSelectedGroup(null); editGroupForm.reset(); }}>Cancel</Button>
                <Button type="submit" className="btn-orange" disabled={editGroupForm.formState.isSubmitting}>{editGroupForm.formState.isSubmitting ? "Saving..." : "Save Changes"}</Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleSubmit(handleCreateGroup)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name", { required: true })} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" {...register("description")} />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input id="priority" type="number" min={1} max={10} {...register("priority", { valueAsNumber: true })} required />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register("isActive")} /> Active
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register("isDefault")} /> Default
                </label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowGroupForm(false); reset(); }}>Cancel</Button>
                <Button type="submit" className="btn-orange" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Group"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!deletingGroup} onOpenChange={(open) => { if (!open) setDeletingGroup(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete the group <b>{deletingGroup?.name}</b>? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingGroup(null)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletingGroup && handleDeleteGroup(deletingGroup.id)} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showItemForm} onOpenChange={(open) => { 
        setShowItemForm(open); 
        if (!open) { 
          itemForm.reset(); 
          setEditingItem(null);
          editItemForm.reset();
        } 
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Create New Item"}</DialogTitle>
          </DialogHeader>
          {editingItem ? (
            <form onSubmit={editItemForm.handleSubmit(handleEditItem)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-item-name">Name</Label>
                  <Input id="edit-item-name" {...editItemForm.register("name", { required: true })} required />
                </div>
                <div>
                  <Label htmlFor="edit-item-priority">Priority</Label>
                  <Input id="edit-item-priority" type="number" min={1} max={10} {...editItemForm.register("priority", { valueAsNumber: true })} required />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-item-description">Description</Label>
                <Input id="edit-item-description" {...editItemForm.register("description")} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-item-model">Model</Label>
                  <Input id="edit-item-model" {...editItemForm.register("model")} />
                </div>
                <div>
                  <Label htmlFor="edit-item-manufacturer">Manufacturer</Label>
                  <Input id="edit-item-manufacturer" {...editItemForm.register("manufacturer")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-item-serial">Serial Number</Label>
                  <Input id="edit-item-serial" {...editItemForm.register("serialNumber")} />
                </div>
                <div>
                  <Label htmlFor="edit-item-location">Location</Label>
                  <Input id="edit-item-location" {...editItemForm.register("location")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-item-frequency">Maintenance Frequency</Label>
                  <Input id="edit-item-frequency" {...editItemForm.register("maintenanceFrequency")} />
                </div>
                <div>
                  <Label htmlFor="edit-item-lifespan">Expected Lifespan (Years)</Label>
                  <Input id="edit-item-lifespan" type="number" min={0} {...editItemForm.register("expectedLifespanYears", { valueAsNumber: true })} />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-item-notes">Maintenance Notes</Label>
                <Input id="edit-item-notes" {...editItemForm.register("maintenanceNotes")} />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...editItemForm.register("isActive")} /> Active
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...editItemForm.register("isRequired")} /> Required
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...editItemForm.register("isCritical")} /> Critical
                </label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowItemForm(false); setEditingItem(null); editItemForm.reset(); }}>Cancel</Button>
                <Button type="submit" className="btn-orange" disabled={editItemForm.formState.isSubmitting}>{editItemForm.formState.isSubmitting ? "Saving..." : "Save Changes"}</Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={itemForm.handleSubmit(handleCreateItem)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-name">Name</Label>
                  <Input id="item-name" {...itemForm.register("name", { required: true })} required />
                </div>
                <div>
                  <Label htmlFor="item-priority">Priority</Label>
                  <Input id="item-priority" type="number" min={1} max={10} {...itemForm.register("priority", { valueAsNumber: true })} required />
                </div>
              </div>
              <div>
                <Label htmlFor="item-description">Description</Label>
                <Input id="item-description" {...itemForm.register("description")} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-model">Model</Label>
                  <Input id="item-model" {...itemForm.register("model")} />
                </div>
                <div>
                  <Label htmlFor="item-manufacturer">Manufacturer</Label>
                  <Input id="item-manufacturer" {...itemForm.register("manufacturer")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-serial">Serial Number</Label>
                  <Input id="item-serial" {...itemForm.register("serialNumber")} />
                </div>
                <div>
                  <Label htmlFor="item-location">Location</Label>
                  <Input id="item-location" {...itemForm.register("location")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-frequency">Maintenance Frequency</Label>
                  <Input id="item-frequency" {...itemForm.register("maintenanceFrequency")} />
                </div>
                <div>
                  <Label htmlFor="item-lifespan">Expected Lifespan (Years)</Label>
                  <Input id="item-lifespan" type="number" min={0} {...itemForm.register("expectedLifespanYears", { valueAsNumber: true })} />
                </div>
              </div>
              <div>
                <Label htmlFor="item-notes">Maintenance Notes</Label>
                <Input id="item-notes" {...itemForm.register("maintenanceNotes")} />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...itemForm.register("isActive")} /> Active
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...itemForm.register("isRequired")} /> Required
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...itemForm.register("isCritical")} /> Critical
                </label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowItemForm(false); itemForm.reset(); }}>Cancel</Button>
                <Button type="submit" className="btn-orange" disabled={itemForm.formState.isSubmitting}>{itemForm.formState.isSubmitting ? "Creating..." : "Create Item"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!deletingItem} onOpenChange={(open) => { if (!open) setDeletingItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete the item <b>{deletingItem?.name}</b>? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingItem(null)} disabled={deleteItemLoading}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletingItem && handleDeleteItem(deletingItem.id)} disabled={deleteItemLoading}>
              {deleteItemLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orama; 