import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Image as ImageIcon, Film, Plus, Star, Trash2, Upload, Loader2, Search } from "lucide-react";

type MediaItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  mediaType?: "photo" | "video";
  altText?: string;
  eventName?: string;
  eventDate?: string;
  isActive: boolean;
  featured: boolean;
  uploadDate?: string;
  displayOrder?: number;
};

const categories = [
  { value: "play", label: "Play Zone" },
  { value: "birthday", label: "Birthday Parties" },
  { value: "decor", label: "Decorations" },
  { value: "events", label: "Events" },
  { value: "activities", label: "Activities" },
  { value: "facilities", label: "Other" },
];

const emptyForm = {
  title: "",
  description: "",
  image: "",
  category: "play",
  altText: "",
  eventName: "",
  eventDate: "",
  isActive: true,
  featured: false,
  displayOrder: 0,
};

export default function GalleryManagement() {
  const { toast } = useToast();
  const [showUpload, setShowUpload] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("play");
  const [albumId, setAlbumId] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const { data: items = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["/api/admin/gallery"],
  });
  const { data: albums = [] } = useQuery<any[]>({ queryKey: ["/api/admin/albums"] });

  const stats = useMemo(() => {
    const list = items || [];
    return {
      photos: list.filter((item) => (item.mediaType || "photo") !== "video").length,
      videos: list.filter((item) => item.mediaType === "video").length,
      published: list.filter((item) => item.isActive).length,
      drafts: list.filter((item) => !item.isActive).length,
    };
  }, [items]);

  const visible = (items || []).filter((item) => {
    const matchesSearch = `${item.title} ${item.description} ${item.eventName || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesStatus = filterStatus === "all" || (filterStatus === "published" ? item.isActive : filterStatus === "draft" ? !item.isActive : item.featured);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
    queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, image: form.image, description: form.description, altText: form.altText || form.title };
      const response = editing
        ? await apiRequest("PUT", `/api/admin/gallery/${editing.id}`, payload)
        : await apiRequest("POST", "/api/admin/gallery", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: editing ? "Media updated" : "Media saved" });
      setEditing(null);
      setForm(emptyForm);
      refresh();
    },
    onError: () => toast({ title: "Could not save", description: "Please try again.", variant: "destructive" }),
  });

  const patchItem = async (item: MediaItem, changes: Partial<MediaItem>) => {
    await apiRequest("PUT", `/api/admin/gallery/${item.id}`, {
      title: item.title,
      description: changes.description ?? item.description,
      image: item.image,
      category: changes.category ?? item.category,
      mediaType: item.mediaType || "photo",
      altText: item.altText || item.title,
      eventName: item.eventName || "",
      eventDate: item.eventDate || "",
      isActive: changes.isActive ?? item.isActive,
      featured: changes.featured ?? item.featured,
      displayOrder: item.displayOrder || 0,
    });
    refresh();
  };

  const deleteIds = async (ids: string[]) => {
    if (!ids.length) return;
    if (!window.confirm(ids.length === 1 ? "Delete this item?" : `Delete ${ids.length} items?`)) return;
    if (ids.length === 1) await apiRequest("DELETE", `/api/admin/gallery/${ids[0]}`);
    else await apiRequest("POST", "/api/admin/gallery/bulk-delete", { ids });
    setSelected([]);
    refresh();
    toast({ title: "Deleted" });
  };

  const uploadBatch = async () => {
    if (!files.length) return;
    setUploading(true);
    setProgress(`Uploading ${files.length} file${files.length === 1 ? "" : "s"}...`);
    try {
      const body = new FormData();
      files.forEach((file) => body.append("files", file));
      body.append("category", category);
      body.append("isActive", String(publishNow));
      if (albumId) body.append("albumId", albumId);
      const response = await fetch("/api/admin/media/batch", { method: "POST", body, credentials: "include" });
      const data = await response.json();
      if (!response.ok && !data.created?.length) throw new Error(data.message || "Upload failed");
      const failed = data.failed?.length || 0;
      toast({
        title: failed ? "Some files need a retry" : "Upload complete",
        description: failed ? `${data.created.length} saved, ${failed} failed.` : `${data.created.length} item${data.created.length === 1 ? "" : "s"} added to the website.`,
        variant: failed ? "destructive" : "default",
      });
      setFiles([]);
      setShowUpload(false);
      refresh();
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message || "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  const openEdit = (item: MediaItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || "",
      image: item.image,
      category: item.category,
      altText: item.altText || item.title,
      eventName: item.eventName || "",
      eventDate: item.eventDate || "",
      isActive: item.isActive,
      featured: item.featured,
      displayOrder: item.displayOrder || 0,
    });
  };

  return (
    <div className="min-h-screen bg-toodles-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display text-toodles-text">Media Manager</h1>
            <p className="text-muted-foreground">Upload photos and videos. Published items appear on the website automatically.</p>
          </div>
          <Button variant="festive" onClick={() => setShowUpload(true)}>
            <Plus className="h-4 w-4" /> Upload photos / videos
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            ["Photos", stats.photos],
            ["Videos", stats.videos],
            ["Published", stats.published],
            ["Drafts", stats.drafts],
          ].map(([label, value]) => (
            <Card key={String(label)} variant="elevated">
              <CardContent className="p-5">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="text-3xl font-display text-toodles-text">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search title or event" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="lg:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="lg:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
            </SelectContent>
          </Select>
          {selected.length > 0 && (
            <Button variant="outline" onClick={() => deleteIds(selected)}>
              <Trash2 className="h-4 w-4" /> Delete {selected.length}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
        ) : visible.length === 0 ? (
          <Card variant="glass" className="text-center">
            <CardContent className="p-12">
              <Upload className="mx-auto h-8 w-8 text-toodles-primary mb-3" />
              <h2 className="font-display text-xl text-toodles-text mb-2">No media yet</h2>
              <p className="text-muted-foreground mb-5">Add photos from a play session or birthday, then publish them.</p>
              <Button variant="festive" onClick={() => setShowUpload(true)}>Upload photos / videos</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visible.map((item) => (
              <Card key={item.id} variant="elevated" className="overflow-hidden">
                <div className="relative h-40 bg-muted">
                  {item.mediaType === "video" ? (
                    <video src={item.image} className="h-full w-full object-cover" muted />
                  ) : (
                    <img src={item.image} alt={item.altText || item.title} className="h-full w-full object-cover" />
                  )}
                  <label className="absolute top-2 left-2 rounded bg-white/90 px-2 py-1 text-xs">
                    <input type="checkbox" className="mr-1" checked={selected.includes(item.id)} onChange={(e) => setSelected((current) => e.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} />
                    Select
                  </label>
                  <Badge className="absolute top-2 right-2">{item.mediaType === "video" ? "Video" : "Photo"}</Badge>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="font-semibold text-toodles-text line-clamp-1">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{categories.find((entry) => entry.value === item.category)?.label || item.category}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={item.isActive ? "success" : "soft"}>{item.isActive ? "Published" : "Draft"}</Badge>
                    {item.featured && <Badge variant="accent">Featured</Badge>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => patchItem(item, { isActive: !item.isActive })}>{item.isActive ? "Unpublish" : "Publish"}</Button>
                    <Button size="sm" variant="outline" onClick={() => patchItem(item, { featured: !item.featured })}><Star className="h-3.5 w-3.5" /> Feature</Button>
                    <Button size="sm" variant="outline" onClick={() => deleteIds([item.id])}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Upload photos / videos</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <label
              className="block rounded-2xl border border-dashed border-toodles-primary/40 bg-white p-8 text-center cursor-pointer"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setFiles(Array.from(event.dataTransfer.files).slice(0, 20));
              }}
            >
              <Upload className="mx-auto h-6 w-6 text-toodles-primary mb-2" />
              <div className="font-medium">Drop files here or browse</div>
              <div className="text-sm text-muted-foreground mt-1">JPG, PNG, WEBP, MP4, MOV · up to 20 files · 50MB each</div>
              <input
                className="hidden"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 20))}
              />
            </label>
            {files.length > 0 && (
              <div className="max-h-36 overflow-auto text-sm space-y-1">
                {files.map((file) => (
                  <div key={file.name} className="flex items-center gap-2">
                    {file.type.startsWith("video") ? <Film className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                    <span className="truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
            <div>
              <Label>Album</Label>
              <Select value={albumId || "none"} onValueChange={(value) => setAlbumId(value === "none" ? "" : value)}>
                <SelectTrigger><SelectValue placeholder="No album" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No album</SelectItem>
                  {albums.map((album) => <SelectItem key={album.id} value={String(album.id)}>{album.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
              Publish immediately on the website
            </label>
            {progress && <p className="text-sm text-muted-foreground">{progress}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setFiles([]); setShowUpload(false); }} disabled={uploading}>Cancel</Button>
              <Button variant="festive" onClick={uploadBatch} disabled={uploading || files.length === 0}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload {files.length || ""}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit media</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Caption</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Alt text</Label><Input value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Event name</Label><Input value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })} /></div>
              <div><Label>Event date</Label><Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} /></div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Published</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button variant="festive" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
