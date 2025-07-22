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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Image, Save, X } from "lucide-react";

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

  const { data: activities, isLoading } = useQuery({
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
    'from-toodles-primary to-pink-400',
    'from-toodles-secondary to-blue-400',
    'from-toodles-accent to-orange-400',
    'from-toodles-success to-green-400',
    'from-purple-400 to-pink-500',
    'from-indigo-400 to-purple-500',
    'from-teal-400 to-cyan-500',
    'from-red-400 to-pink-500'
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
              <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">Add New Activity</DialogTitle>
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
                    <Label htmlFor="image" className="text-gray-700 dark:text-gray-300">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
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
                    <Label htmlFor="gradient" className="text-gray-700 dark:text-gray-300">Color Gradient</Label>
                    <select
                      id="gradient"
                      value={formData.gradient}
                      onChange={(e) => setFormData(prev => ({ ...prev, gradient: e.target.value }))}
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                      {gradientOptions.map(gradient => (
                        <option key={gradient} value={gradient}>{gradient}</option>
                      ))}
                    </select>
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Activity</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-icon">Icon/Emoji</Label>
                    <Input
                      id="edit-icon"
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-image">Image URL</Label>
                  <Input
                    id="edit-image"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-ageGroup">Age Group</Label>
                    <Input
                      id="edit-ageGroup"
                      value={formData.ageGroup}
                      onChange={(e) => setFormData(prev => ({ ...prev, ageGroup: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-safetyRating">Safety Rating (1-5)</Label>
                    <Input
                      id="edit-safetyRating"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.safetyRating}
                      onChange={(e) => setFormData(prev => ({ ...prev, safetyRating: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-gradient">Color Gradient</Label>
                  <select
                    id="edit-gradient"
                    value={formData.gradient}
                    onChange={(e) => setFormData(prev => ({ ...prev, gradient: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    {gradientOptions.map(gradient => (
                      <option key={gradient} value={gradient}>{gradient}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <Label htmlFor="edit-isActive">Active (visible to customers)</Label>
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