import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PERMISSIONS } from "@/hooks/usePermissions";
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Users,
  Clock,
  IndianRupee,
  Gift,
  Calendar,
  Star
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PackageData {
  id: number;
  name: string;
  type: 'walk_in' | 'weekend' | 'monthly' | 'birthday';
  price: string;
  duration: number;
  description: string | null;
  features: string[];
  maxChildren: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PackageForm {
  name: string;
  type: 'walk_in' | 'weekend' | 'monthly' | 'birthday';
  price: string;
  duration: number;
  description: string;
  features: string[];
  maxChildren: number;
  isActive: boolean;
}

export default function PackageManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  const [packageForm, setPackageForm] = useState<PackageForm>({
    name: '',
    type: 'walk_in',
    price: '',
    duration: 2,
    description: '',
    features: [],
    maxChildren: 15,
    isActive: true
  });
  const [newFeature, setNewFeature] = useState('');
  const { toast } = useToast();

  // Fetch packages
  const { data: packages = [], isLoading } = useQuery<PackageData[]>({
    queryKey: ['/api/packages'],
    staleTime: 5 * 60 * 1000,
  });

  // Create package mutation
  const createPackageMutation = useMutation({
    mutationFn: async (packageData: Omit<PackageForm, 'id'>) => {
      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create package');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Package created successfully"
      });
    }
  });

  // Update package mutation
  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, ...packageData }: PackageForm & { id: number }) => {
      const response = await fetch(`/api/admin/packages/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update package');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      setEditingPackage(null);
      resetForm();
      toast({
        title: "Success",
        description: "Package updated successfully"
      });
    }
  });

  // Delete package mutation
  const deletePackageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete package');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      toast({
        title: "Success",
        description: "Package deleted successfully"
      });
    }
  });

  const resetForm = () => {
    setPackageForm({
      name: '',
      type: 'walk_in',
      price: '',
      duration: 2,
      description: '',
      features: [],
      maxChildren: 15,
      isActive: true
    });
    setNewFeature('');
  };

  const handleCreatePackage = () => {
    setEditingPackage(null);
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEditPackage = (pkg: PackageData) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      type: pkg.type,
      price: pkg.price,
      duration: pkg.duration,
      description: pkg.description || '',
      features: pkg.features || [],
      maxChildren: pkg.maxChildren,
      isActive: pkg.isActive
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeletePackage = (id: number) => {
    if (window.confirm("Are you sure you want to delete this package? This action cannot be undone.")) {
      deletePackageMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPackage) {
      updatePackageMutation.mutate({ ...packageForm, id: editingPackage.id });
    } else {
      createPackageMutation.mutate(packageForm);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !packageForm.features.includes(newFeature.trim())) {
      setPackageForm({
        ...packageForm,
        features: [...packageForm.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setPackageForm({
      ...packageForm,
      features: packageForm.features.filter(f => f !== feature)
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'birthday': return 'bg-purple-500';
      case 'monthly': return 'bg-green-500';
      case 'weekend': return 'bg-blue-500';
      default: return 'bg-orange-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'birthday': return <Gift className="h-3 w-3" />;
      case 'monthly': return <Calendar className="h-3 w-3" />;
      case 'weekend': return <Star className="h-3 w-3" />;
      default: return <Package className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-toodles-background p-6">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-toodles-background">
      <Header />
      
      <div className="p-6">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-toodles-text font-display">
              Package Management
            </h1>
            <p className="text-toodles-text/70 font-accent">
              Create and manage play packages for customers
            </p>
          </div>
          <Button 
            onClick={handleCreatePackage}
            className="bg-toodles-primary hover:bg-toodles-primary/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border-toodles-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
              <Package className="h-4 w-4 text-toodles-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-toodles-primary">{packages.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-toodles-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {packages.filter(pkg => pkg.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-toodles-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Birthday Packages</CardTitle>
              <Gift className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">
                {packages.filter(pkg => pkg.type === 'birthday').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-toodles-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <IndianRupee className="h-4 w-4 text-toodles-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-toodles-success">
                ₹{packages.length > 0 ? Math.round(packages.reduce((sum, pkg) => sum + parseFloat(pkg.price), 0) / packages.length) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Packages Table */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              All Packages ({packages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package Details</TableHead>
                    <TableHead>Type & Price</TableHead>
                    <TableHead>Duration & Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-toodles-text">{pkg.name}</div>
                          <div className="text-sm text-gray-500">
                            {pkg.description || 'No description'}
                          </div>
                          {pkg.features && pkg.features.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {pkg.features.slice(0, 2).map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {pkg.features.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{pkg.features.length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={`${getTypeColor(pkg.type)} text-white`}>
                            {getTypeIcon(pkg.type)}
                            <span className="ml-1 capitalize">{pkg.type.replace('_', ' ')}</span>
                          </Badge>
                          <div className="flex items-center text-sm font-medium">
                            <IndianRupee className="h-3 w-3 mr-1" />
                            {pkg.price}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            {pkg.duration} hours
                          </div>
                          <div className="flex items-center text-sm">
                            <Users className="h-3 w-3 mr-1" />
                            Max {pkg.maxChildren} kids
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {pkg.isActive ? (
                          <Badge variant="default" className="bg-green-500">
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPackage(pkg)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePackage(pkg.id)}
                            disabled={deletePackageMutation.isPending}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {packages.length === 0 && (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No packages found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start by creating your first package
                  </p>
                  <Button 
                    onClick={handleCreatePackage}
                    className="mt-4 bg-toodles-primary hover:bg-toodles-primary/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Package
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Package Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 border border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {editingPackage ? 'Edit Package' : 'Create New Package'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingPackage ? 'Update package details' : 'Add a new package for customers to book'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-900 font-medium">Package Name</Label>
                  <Input
                    id="name"
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({...packageForm, name: e.target.value})}
                    placeholder="e.g., Basic Play Package"
                    required
                    className="mt-1 border-gray-300 focus:border-toodles-primary focus:ring-toodles-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-gray-900 font-medium">Package Type</Label>
                  <Select 
                    value={packageForm.type} 
                    onValueChange={(value) => setPackageForm({...packageForm, type: value as any})}
                  >
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-toodles-primary focus:ring-toodles-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="walk_in">Walk-in</SelectItem>
                      <SelectItem value="weekend">Weekend</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price" className="text-gray-900 font-medium">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({...packageForm, price: e.target.value})}
                    placeholder="299"
                    required
                    className="mt-1 border-gray-300 focus:border-toodles-primary focus:ring-toodles-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="duration" className="text-gray-900 font-medium">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={packageForm.duration}
                    onChange={(e) => setPackageForm({...packageForm, duration: parseInt(e.target.value)})}
                    min="1"
                    max="12"
                    required
                    className="mt-1 border-gray-300 focus:border-toodles-primary focus:ring-toodles-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="maxChildren" className="text-gray-900 font-medium">Max Children</Label>
                  <Input
                    id="maxChildren"
                    type="number"
                    value={packageForm.maxChildren}
                    onChange={(e) => setPackageForm({...packageForm, maxChildren: parseInt(e.target.value)})}
                    min="1"
                    max="50"
                    required
                    className="mt-1 border-gray-300 focus:border-toodles-primary focus:ring-toodles-primary"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={packageForm.isActive}
                    onCheckedChange={(checked) => setPackageForm({...packageForm, isActive: checked})}
                    className="data-[state=checked]:bg-toodles-primary"
                  />
                  <Label htmlFor="isActive" className="text-gray-900 font-medium">Package Active</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-900 font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({...packageForm, description: e.target.value})}
                  placeholder="Describe what's included in this package..."
                  rows={3}
                  className="mt-1 border-gray-300 focus:border-toodles-primary focus:ring-toodles-primary"
                />
              </div>

              <div>
                <Label className="text-gray-900 font-medium">Package Features</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="border-gray-300 focus:border-toodles-primary focus:ring-toodles-primary"
                  />
                  <Button 
                    type="button" 
                    onClick={addFeature}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {packageForm.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {packageForm.features.map((feature, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeFeature(feature)}
                      >
                        {feature} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-toodles-primary hover:bg-toodles-primary/90 text-white"
                  disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
                >
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}