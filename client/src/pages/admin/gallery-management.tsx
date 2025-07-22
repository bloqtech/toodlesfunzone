import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Image, Save, Filter, Calendar } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'play-zones' | 'birthday-parties' | 'events' | 'activities' | 'facilities';
  isActive: boolean;
  uploadDate: string;
  featured: boolean;
}

export default function GalleryManagement() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    category: 'play-zones' as const,
    isActive: true,
    featured: false
  });

  const { toast } = useToast();

  const { data: galleryItems, isLoading } = useQuery({
    queryKey: ["/api/admin/gallery"],
  });

  const categories = [
    { value: 'play-zones', label: 'Play Zones' },
    { value: 'birthday-parties', label: 'Birthday Parties' },
    { value: 'events', label: 'Events' },
    { value: 'activities', label: 'Activities' },
    { value: 'facilities', label: 'Facilities' }
  ];

  const addItemMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/admin/gallery', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Gallery Item Added",
        description: "New gallery item has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      setShowAddDialog(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add gallery item. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const response = await apiRequest('PUT', `/api/admin/gallery/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Gallery Item Updated",
        description: "Gallery item has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      setEditingItem(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update gallery item. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/gallery/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Gallery Item Deleted",
        description: "Gallery item has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete gallery item. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      category: 'play-zones',
      isActive: true,
      featured: false
    });
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      image: item.image,
      category: item.category,
      isActive: item.isActive,
      featured: item.featured
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      addItemMutation.mutate(formData);
    }
  };

  const filteredItems = galleryItems?.filter((item: GalleryItem) => 
    filterCategory === 'all' || item.category === filterCategory
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gallery Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage photo gallery and visual content</p>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-toodles-primary hover:bg-toodles-primary/80">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Photo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">
                    {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}>
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          {categories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image" className="text-gray-700 dark:text-gray-300">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-4 h-4 text-toodles-primary bg-white border-gray-300 rounded focus:ring-toodles-primary"
                      />
                      <Label htmlFor="isActive" className="text-gray-700 dark:text-gray-300">Active (visible to customers)</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="w-4 h-4 text-toodles-primary bg-white border-gray-300 rounded focus:ring-toodles-primary"
                      />
                      <Label htmlFor="featured" className="text-gray-700 dark:text-gray-300">Featured Photo</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowAddDialog(false);
                        setEditingItem(null);
                        resetForm();
                      }}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addItemMutation.isPending || updateItemMutation.isPending}
                      className="bg-toodles-primary hover:bg-toodles-primary/80"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingItem ? 'Update Photo' : 'Add Photo'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filter Controls */}
          <div className="mb-6 flex items-center space-x-4">
            <Label className="text-gray-700 dark:text-gray-300">Filter by category:</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Loading gallery items...</p>
            </div>
          ) : filteredItems?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No gallery items found. Add your first photo!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems?.map((item: GalleryItem) => (
                <Card key={item.id} className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {item.featured && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                        Featured
                      </Badge>
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => handleEdit(item)}
                        className="bg-white/90 hover:bg-white text-gray-900"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteItemMutation.mutate(item.id)}
                        className="bg-red-600/90 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Category:</span>
                        <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                          {categories.find(cat => cat.value === item.category)?.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <Badge variant={item.isActive ? "default" : "secondary"} className={item.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Uploaded:</span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {new Date(item.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}