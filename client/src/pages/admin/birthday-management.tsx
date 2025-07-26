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
import { Plus, Edit, Trash2, Save, Gift, Users, Clock, DollarSign } from "lucide-react";

interface BirthdayPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // in hours
  maxGuests: number;
  features: string[];
  decorationTheme: string;
  isActive: boolean;
  isPopular: boolean;
  ageGroup: string;
  image: string;
}

export default function BirthdayManagement() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<BirthdayPackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 2,
    maxGuests: 10,
    features: [''] as string[],
    decorationTheme: '',
    isActive: true,
    isPopular: false,
    ageGroup: '5-12 years',
    image: ''
  });

  const { toast } = useToast();

  const { data: birthdayPackages, isLoading } = useQuery({
    queryKey: ["/api/admin/birthday-packages"],
  });

  const addPackageMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/admin/birthday-packages', {
        ...data,
        features: data.features.filter(f => f.trim() !== '')
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Birthday Package Added",
        description: "New birthday package has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/birthday-packages"] });
      setShowAddDialog(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add birthday package. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const response = await apiRequest('PUT', `/api/admin/birthday-packages/${id}`, {
        ...data,
        features: data.features.filter(f => f.trim() !== '')
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Birthday Package Updated",
        description: "Birthday package has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/birthday-packages"] });
      setEditingPackage(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update birthday package. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/birthday-packages/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Birthday Package Deleted",
        description: "Birthday package has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/birthday-packages"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete birthday package. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 2,
      maxGuests: 10,
      features: [''],
      decorationTheme: '',
      isActive: true,
      isPopular: false,
      ageGroup: '5-12 years',
      image: ''
    });
  };

  const handleEdit = (pkg: BirthdayPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration,
      maxGuests: pkg.maxGuests,
      features: pkg.features.length > 0 ? pkg.features : [''],
      decorationTheme: pkg.decorationTheme,
      isActive: pkg.isActive,
      isPopular: pkg.isPopular,
      ageGroup: pkg.ageGroup,
      image: pkg.image
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPackage) {
      updatePackageMutation.mutate({ id: editingPackage.id, data: formData });
    } else {
      addPackageMutation.mutate(formData);
    }
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const decorationThemes = [
    'Princess & Fairy Tale',
    'Superhero Adventure',
    'Jungle Safari',
    'Under the Sea',
    'Space & Astronaut',
    'Unicorn Magic',
    'Pirate Adventure',
    'Dinosaur World',
    'Racing Cars',
    'Custom Theme'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Birthday Party Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage birthday party packages and themes</p>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-toodles-primary hover:bg-toodles-primary/80">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Birthday Package
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 border shadow-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Add New Birthday Package</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Package Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder="e.g., Princess Party Deluxe"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="decorationTheme" className="text-sm font-medium text-gray-700 dark:text-gray-300">Decoration Theme</Label>
                      <Select 
                        value={formData.decorationTheme} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, decorationTheme: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          {decorationThemes.map(theme => (
                            <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                      placeholder="Detailed description of the birthday package"
                      className="w-full min-h-[100px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-medium text-gray-700 dark:text-gray-300">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                        required
                        min="0"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration (hours)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        required
                        min="1"
                        max="8"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="maxGuests" className="text-sm font-medium text-gray-700 dark:text-gray-300">Maximum Guests</Label>
                      <Input
                        id="maxGuests"
                        type="number"
                        value={formData.maxGuests}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxGuests: parseInt(e.target.value) }))}
                        required
                        min="1"
                        max="50"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ageGroup" className="text-sm font-medium text-gray-700 dark:text-gray-300">Age Group</Label>
                      <Input
                        id="ageGroup"
                        value={formData.ageGroup}
                        onChange={(e) => setFormData(prev => ({ ...prev, ageGroup: e.target.value }))}
                        placeholder="e.g., 5-12 years"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-sm font-medium text-gray-700 dark:text-gray-300">Package Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/birthday-package.jpg"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Package Features</Label>
                      <Button type="button" size="sm" onClick={addFeature} className="bg-toodles-primary hover:bg-toodles-primary/80">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Feature
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            placeholder="e.g., Themed decorations included"
                            className="flex-1"
                          />
                          {formData.features.length > 1 && (
                            <Button 
                              type="button" 
                              size="sm" 
                              variant="outline"
                              onClick={() => removeFeature(index)}
                              className="shrink-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="h-4 w-4 text-toodles-primary"
                      />
                      <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active (visible to customers)</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isPopular"
                        checked={formData.isPopular}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                        className="h-4 w-4 text-toodles-primary"
                      />
                      <Label htmlFor="isPopular" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark as Popular</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="min-w-[80px]">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addPackageMutation.isPending} className="bg-toodles-primary hover:bg-toodles-primary/80 min-w-[120px]">
                      <Save className="h-4 w-4 mr-2" />
                      {addPackageMutation.isPending ? 'Saving...' : 'Add Package'}
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
              {birthdayPackages?.map((pkg: BirthdayPackage) => (
                <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {pkg.image && (
                      <img 
                        src={pkg.image} 
                        alt={pkg.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(pkg)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deletePackageMutation.mutate(pkg.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    {pkg.isPopular && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-toodles-accent text-black">Popular</Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-lg text-toodles-text">{pkg.name}</h3>
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pkg.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ₹{pkg.price}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {pkg.duration}h
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          Max {pkg.maxGuests} guests
                        </span>
                        <span className="text-xs text-gray-500">{pkg.ageGroup}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Badge variant="outline" className="text-xs">
                        {pkg.decorationTheme}
                      </Badge>
                    </div>
                    
                    {pkg.features.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {pkg.features.slice(0, 2).map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {pkg.features.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{pkg.features.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={!!editingPackage} onOpenChange={() => setEditingPackage(null)}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 border shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Edit Birthday Package</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Package Name</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-decorationTheme">Decoration Theme</Label>
                    <Select 
                      value={formData.decorationTheme} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, decorationTheme: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {decorationThemes.map(theme => (
                          <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-price">Price (₹)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-duration">Duration (hours)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      required
                      min="1"
                      max="8"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-maxGuests">Maximum Guests</Label>
                    <Input
                      id="edit-maxGuests"
                      type="number"
                      value={formData.maxGuests}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxGuests: parseInt(e.target.value) }))}
                      required
                      min="1"
                      max="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-ageGroup">Age Group</Label>
                    <Input
                      id="edit-ageGroup"
                      value={formData.ageGroup}
                      onChange={(e) => setFormData(prev => ({ ...prev, ageGroup: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-image">Package Image URL</Label>
                  <Input
                    id="edit-image"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Package Features</Label>
                    <Button type="button" size="sm" onClick={addFeature}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="e.g., Themed decorations included"
                          className="flex-1"
                        />
                        {formData.features.length > 1 && (
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline"
                            onClick={() => removeFeature(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                    <Label htmlFor="edit-isActive">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-isPopular"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                    />
                    <Label htmlFor="edit-isPopular">Mark as Popular</Label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingPackage(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updatePackageMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Update Package
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