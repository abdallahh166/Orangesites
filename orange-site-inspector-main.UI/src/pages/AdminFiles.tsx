import { useState } from "react";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, Trash2 } from "lucide-react";

export default function AdminFiles() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      // For demo: use visitId=1, componentId=1
      const res = await apiClient.uploadVisitImage(selectedFile, 1, 1);
      if (!res.success) throw new Error(res.message);
      setUploaded(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!uploaded) return;
    setUploading(true);
    setError(null);
    try {
      await apiClient.deleteVisitImage(uploaded.fileName, uploaded.visitId);
      setUploaded(null);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">File Upload Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload Visit Image</CardTitle>
        </CardHeader>
        <CardContent>
          <input type="file" onChange={handleFileChange} />
          <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="ml-2">
            <UploadCloud className="h-4 w-4 mr-1" /> Upload
          </Button>
          {uploading && <Loader2 className="animate-spin h-5 w-5 text-orange-500 ml-2 inline" />}
          {error && <div className="text-red-600 mt-2">{error}</div>}
          {uploaded && (
            <div className="mt-4 flex items-center gap-4">
              <img src={uploaded.filePath} alt="Uploaded" className="h-24 rounded border" />
              <Button variant="destructive" onClick={handleDelete}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 