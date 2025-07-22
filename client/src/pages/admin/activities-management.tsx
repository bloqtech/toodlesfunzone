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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Image, Save, X, Palette, Upload, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Activity {
  id: string;
  title: string;
  description: string;
  image: string;
  gradient: string;
  icon: string;
  ageGroup: string;
  safetyRating: number;
  isActive: boolean;
}

export default function ActivitiesManagement() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    gradient: 'from-toodles-primary to-pink-400',
    icon: '🎪',
    ageGroup: '',
    safetyRating: 5,
    isActive: true
  });

  const { toast } = useToast();

  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/admin/activities"],
  });

  const addActivityMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/admin/activities', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Activity Added",
        description: "New activity has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/activities"] });
      setShowAddDialog(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add activity. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const response = await apiRequest('PUT', `/api/admin/activities/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Activity Updated",
        description: "Activity has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/activities"] });
      setEditingActivity(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update activity. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/activities/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Activity Deleted",
        description: "Activity has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/activities"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete activity. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      gradient: 'from-toodles-primary to-pink-400',
      icon: '🎪',
      ageGroup: '',
      safetyRating: 5,
      isActive: true
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
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

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      image: activity.image,
      gradient: activity.gradient,
      icon: activity.icon,
      ageGroup: activity.ageGroup,
      safetyRating: activity.safetyRating,
      isActive: activity.isActive
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingActivity) {
      updateActivityMutation.mutate({ id: editingActivity.id, data: formData });
    } else {
      addActivityMutation.mutate(formData);
    }
  };

  const gradientOptions = [
    { value: 'from-toodles-primary to-pink-400', label: 'Pink Toodles', preview: 'bg-gradient-to-r from-pink-500 to-pink-400' },
    { value: 'from-toodles-secondary to-blue-400', label: 'Blue Adventure', preview: 'bg-gradient-to-r from-blue-500 to-blue-400' },
    { value: 'from-toodles-accent to-orange-400', label: 'Orange Energy', preview: 'bg-gradient-to-r from-orange-500 to-orange-400' },
    { value: 'from-toodles-success to-green-400', label: 'Green Nature', preview: 'bg-gradient-to-r from-green-500 to-green-400' },
    { value: 'from-purple-400 to-pink-500', label: 'Purple Fantasy', preview: 'bg-gradient-to-r from-purple-400 to-pink-500' },
    { value: 'from-indigo-400 to-purple-500', label: 'Indigo Dream', preview: 'bg-gradient-to-r from-indigo-400 to-purple-500' },
    { value: 'from-teal-400 to-cyan-500', label: 'Ocean Blue', preview: 'bg-gradient-to-r from-teal-400 to-cyan-500' },
    { value: 'from-red-400 to-pink-500', label: 'Warm Sunset', preview: 'bg-gradient-to-r from-red-400 to-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Activities Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage play zone activities and attractions</p>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-toodles-primary hover:bg-toodles-primary/80">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white flex items-center">
                    <Plus className="h-5 w-5 mr-2 text-toodles-primary" />
                    Add New Activity
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    Create a new activity that will be displayed on the homepage for customers to see.
                  </DialogDescription>
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
                      <Label htmlFor="icon" className="text-gray-700 dark:text-gray-300">Icon/Emoji</Label>
                      <Input
                        id="icon"
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="🎪"
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
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
                    <Label className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                      <Image className="h-4 w-4 mr-2" />
                      Activity Image
                    </Label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={formData.image}
                          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                          placeholder="Image URL or upload file below"
                          className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
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
                    <div>
                      <Label htmlFor="ageGroup" className="text-gray-700 dark:text-gray-300">Age Group</Label>
                      <Input
                        id="ageGroup"
                        value={formData.ageGroup}
                        onChange={(e) => setFormData(prev => ({ ...prev, ageGroup: e.target.value }))}
                        placeholder="2-5 years"
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="safetyRating" className="text-gray-700 dark:text-gray-300">Safety Rating (1-5)</Label>
                      <Input
                        id="safetyRating"
                        type="number"
                        min="1"
                        max="5"
                        value={formData.safetyRating}
                        onChange={(e) => setFormData(prev => ({ ...prev, safetyRating: parseInt(e.target.value) }))}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="gradient" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                      <Palette className="h-4 w-4 mr-2" />
                      Color Gradient
                    </Label>
                    <Select value={formData.gradient} onValueChange={(value) => setFormData(prev => ({ ...prev, gradient: value }))}>
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Choose a gradient" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradientOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-4 rounded ${option.preview}`}></div>
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
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
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addActivityMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities?.map((activity: Activity) => (
                <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`h-3 bg-gradient-to-r ${activity.gradient}`}></div>
                  <div className="relative">
                    {activity.image && (
                      <img 
                        src={activity.image} 
                        alt={activity.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(activity)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteActivityMutation.mutate(activity.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-lg text-toodles-text">
                        {activity.icon} {activity.title}
                      </h3>
                      <Badge variant={activity.isActive ? "default" : "secondary"}>
                        {activity.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Age: {activity.ageGroup}</span>
                      <span>Safety: {"★".repeat(activity.safetyRating)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={!!editingActivity} onOpenChange={() => setEditingActivity(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white flex items-center">
                  <Edit className="h-5 w-5 mr-2 text-toodles-primary" />
                  Edit Activity
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Modify this activity's details. Changes will be reflected on the homepage immediately.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-title" className="text-gray-700 dark:text-gray-300">Title</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-icon" className="text-gray-700 dark:text-gray-300">Icon/Emoji</Label>
                    <Input
                      id="edit-icon"
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="🎪"
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-description" className="text-gray-700 dark:text-gray-300">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <Image className="h-4 w-4 mr-2" />
                    Activity Image
                  </Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={formData.image}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="Image URL or upload file below"
                        className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
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
                  <div>
                    <Label htmlFor="edit-ageGroup" className="text-gray-700 dark:text-gray-300">Age Group</Label>
                    <Input
                      id="edit-ageGroup"
                      value={formData.ageGroup}
                      onChange={(e) => setFormData(prev => ({ ...prev, ageGroup: e.target.value }))}
                      placeholder="2-5 years"
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-safetyRating" className="text-gray-700 dark:text-gray-300">Safety Rating (1-5)</Label>
                    <Input
                      id="edit-safetyRating"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.safetyRating}
                      onChange={(e) => setFormData(prev => ({ ...prev, safetyRating: parseInt(e.target.value) }))}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-gradient" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <Palette className="h-4 w-4 mr-2" />
                    Color Gradient
                  </Label>
                  <Select value={formData.gradient} onValueChange={(value) => setFormData(prev => ({ ...prev, gradient: value }))}>
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Choose a gradient" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-4 rounded ${option.preview}`}></div>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-toodles-primary bg-white border-gray-300 rounded focus:ring-toodles-primary"
                  />
                  <Label htmlFor="edit-isActive" className="text-gray-700 dark:text-gray-300">Active (visible to customers)</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingActivity(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateActivityMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Update Activity
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}