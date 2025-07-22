import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Image, Save, X, Upload, Loader2, Package, Camera, Utensils, Clock, Star } from "lucide-react";

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  image?: string;
  category: string;
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
  applicablePackages?: string[];
}

const categoryOptions = [
  { value: 'general', label: 'General', icon: Package },
  { value: 'photography', label: 'Photography', icon: Camera },
  { value: 'food', label: 'Food & Snacks', icon: Utensils },
  { value: 'time', label: 'Time Extension', icon: Clock },
  { value: 'premium', label: 'Premium Services', icon: Star },
];

const iconOptions = [
  '📸', '🍎', '🧦', '⏰', '🎂', '🎵', '🎈', '🎨', '⚽', '🏰', '🎪', '🎭', '🎯', '🎲'
];

export default function AddOnsManagement() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    icon: '📸',
    image: '',
    category: 'general',
    isRequired: false,
    isActive: true,
    displayOrder: 0,
    applicablePackages: [] as string[]
  });

  const { toast } = useToast();

  const { data: addOns, isLoading } = useQuery({
    queryKey: ["/api/admin/add-ons"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/admin/add-ons`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/add-ons"] });
      setShowAddDialog(false);
      resetForm();
      toast({
        title: "Add-on Created",
        description: "The add-on has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create add-on. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/admin/add-ons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/add-ons"] });
      setEditingAddOn(null);
      resetForm();
      toast({
        title: "Add-on Updated",
        description: "The add-on has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update add-on. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/add-ons/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/add-ons"] });
      toast({
        title: "Add-on Deleted",
        description: "The add-on has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete add-on. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      icon: '📸',
      image: '',
      category: 'general',
      isRequired: false,
      isActive: true,
      displayOrder: 0,
      applicablePackages: []
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, image: data.url }));
      
      toast({
        title: "Image Uploaded",
        description: "Image has been uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed", 
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddOn) {
      updateMutation.mutate({ id: editingAddOn.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (addOn: AddOn) => {
    setEditingAddOn(addOn);
    setFormData({
      name: addOn.name,
      description: addOn.description,
      price: addOn.price,
      icon: addOn.icon,
      image: addOn.image || '',
      category: addOn.category,
      isRequired: addOn.isRequired,
      isActive: addOn.isActive,
      displayOrder: addOn.displayOrder,
      applicablePackages: addOn.applicablePackages || []
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this add-on?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display text-toodles-text">Add-ons Management</h1>
          <p className="text-gray-600 mt-2">Manage optional add-on services and experiences</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-toodles-primary hover:bg-toodles-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add New Add-on
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Add-on</DialogTitle>
              <DialogDescription>
                Add a new optional service or experience for customers
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Add-on Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Photography Package"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    placeholder="299"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Professional photos of your child's play session"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Icon</Label>
                  <Select 
                    value={formData.icon} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <span className="text-2xl">{icon}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="flex items-center mb-2">
                  <Image className="h-4 w-4 mr-2" />
                  Add-on Image
                </Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="Image URL or upload file below"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload-add')?.click()}
                      disabled={uploading}
                      className="px-3"
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                  </div>
                  <input
                    id="file-upload-add"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {formData.image && (
                    <div className="relative">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Upload an image file or enter a URL above</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isRequired"
                    checked={formData.isRequired}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRequired: checked }))}
                  />
                  <Label htmlFor="isRequired">Required Add-on</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
                  placeholder="0"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="bg-toodles-primary hover:bg-toodles-primary/90"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Create Add-on
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add-ons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addOns?.map((addOn: AddOn) => (
          <Card key={addOn.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{addOn.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{addOn.name}</CardTitle>
                    <CardDescription>₹{addOn.price}</CardDescription>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(addOn)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(addOn.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {addOn.image && (
                <img
                  src={addOn.image}
                  alt={addOn.name}
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              <p className="text-sm text-gray-600 mb-3">{addOn.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={addOn.isActive ? "default" : "secondary"}>
                  {addOn.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">{addOn.category}</Badge>
                {addOn.isRequired && (
                  <Badge variant="destructive">Required</Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Display Order: {addOn.displayOrder}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingAddOn} onOpenChange={(open) => !open && setEditingAddOn(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Add-on</DialogTitle>
            <DialogDescription>
              Update the add-on details
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Add-on Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Photography Package"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price (₹)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  placeholder="299"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Professional photos of your child's play session"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Icon</Label>
                <Select 
                  value={formData.icon} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <span className="text-2xl">{icon}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="flex items-center mb-2">
                <Image className="h-4 w-4 mr-2" />
                Add-on Image
              </Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="Image URL or upload file below"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload-edit')?.click()}
                    disabled={uploading}
                    className="px-3"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
                <input
                  id="file-upload-edit"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {formData.image && (
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500">Upload an image file or enter a URL above</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isRequired"
                  checked={formData.isRequired}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRequired: checked }))}
                />
                <Label htmlFor="edit-isRequired">Required Add-on</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-displayOrder">Display Order</Label>
              <Input
                id="edit-displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
                placeholder="0"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="bg-toodles-primary hover:bg-toodles-primary/90"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Update Add-on
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingAddOn(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {addOns?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-display text-toodles-text mb-2">No Add-ons Yet</h3>
          <p className="text-gray-600 mb-6">Create your first optional add-on service</p>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-toodles-primary hover:bg-toodles-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Add-on
          </Button>
        </div>
      )}
    </div>
  );
}