import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, Users, Package as PackageIcon, Calendar, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { PackageSale, Package, PackageUsage } from "@shared/schema";

export function PackageManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPackageSale, setSelectedPackageSale] = useState<PackageSale | null>(null);
  const [usageDialogOpen, setUsageDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch packages for dropdown
  const { data: packages = [] } = useQuery<Package[]>({
    queryKey: ['/api/packages'],
  });

  // Fetch package sales
  const { data: packageSales = [], isLoading: salesLoading } = useQuery<PackageSale[]>({
    queryKey: ['/api/package-sales'],
  });

  // Fetch active package sales
  const { data: activePackages = [] } = useQuery<PackageSale[]>({
    queryKey: ['/api/package-sales/active'],
  });

  // Create package sale mutation
  const createSaleMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/package-sales', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/package-sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/package-sales/active'] });
      setIsDialogOpen(false);
      toast({
        title: "Package Sale Created",
        description: "Hour package has been sold successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create package sale",
        variant: "destructive",
      });
    },
  });

  // Record usage mutation
  const recordUsageMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/package-usage', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/package-sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/package-sales/active'] });
      setUsageDialogOpen(false);
      setSelectedPackageSale(null);
      toast({
        title: "Usage Recorded",
        description: "Package hours have been deducted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record usage",
        variant: "destructive",
      });
    },
  });

  const handleCreateSale = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const selectedPackage = packages.find(p => p.id === parseInt(formData.get('packageId') as string));
    
    const saleData = {
      packageId: parseInt(formData.get('packageId') as string),
      totalHours: selectedPackage?.duration || parseInt(formData.get('totalHours') as string),
      customerName: formData.get('customerName') as string,
      customerPhone: formData.get('customerPhone') as string,
      customerEmail: formData.get('customerEmail') as string,
      totalAmount: formData.get('totalAmount') as string,
      notes: formData.get('notes') as string,
      soldBy: 'admin', // This should be the current admin user ID
    };

    createSaleMutation.mutate(saleData);
  };

  const handleRecordUsage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const usageData = {
      packageSaleId: selectedPackageSale?.id,
      hoursUsed: parseInt(formData.get('hoursUsed') as string),
      numberOfChildren: parseInt(formData.get('numberOfChildren') as string),
      attendingChildrenNames: (formData.get('childrenNames') as string).split(',').map(name => name.trim()).filter(Boolean),
      supervisorNotes: formData.get('supervisorNotes') as string,
      checkedInBy: 'admin', // This should be the current admin user ID
    };

    recordUsageMutation.mutate(usageData);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'active': 'bg-green-100 text-green-800',
      'expired': 'bg-red-100 text-red-800',
      'used_up': 'bg-orange-100 text-orange-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-toodles-text mb-2">Package Management</h1>
        <p className="text-gray-600">Manage hour-based package sales and track usage</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePackages.length}</div>
            <p className="text-xs text-muted-foreground">Currently valid</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Sold</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packageSales.reduce((total, sale) => total + sale.totalHours, 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activePackages.reduce((total, sale) => total + sale.remainingHours, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Available to use</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{packageSales.reduce((total, sale) => total + parseFloat(sale.totalAmount), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From packages</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-toodles-primary hover:bg-toodles-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Sell Package
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-gray-100">Sell Hour Package</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Record a new package sale with customer details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSale} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="packageId" className="text-sm font-medium">Package Type</Label>
                <Select name="packageId" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id.toString()}>
                        {pkg.name} - {pkg.duration} hours (₹{pkg.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-sm font-medium">Customer Name</Label>
                <Input name="customerName" placeholder="Enter customer's full name" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-sm font-medium">Phone Number</Label>
                <Input name="customerPhone" type="tel" placeholder="+91 9876543210" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="text-sm font-medium">Email (Optional)</Label>
                <Input name="customerEmail" type="email" placeholder="customer@example.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalAmount" className="text-sm font-medium">Amount Paid (₹)</Label>
                <Input name="totalAmount" type="number" step="0.01" placeholder="0.00" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
                <Textarea name="notes" rows={2} placeholder="Any additional notes about the sale..." />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-toodles-primary hover:bg-toodles-primary/90 text-white"
                disabled={createSaleMutation.isPending}
              >
                {createSaleMutation.isPending ? "Creating Sale..." : "Create Package Sale"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Packages */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Active Packages</CardTitle>
          <CardDescription>Packages with remaining hours that can be used</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {activePackages.map((packageSale) => (
              <div key={packageSale.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-medium">{packageSale.customerName}</h3>
                      <p className="text-sm text-gray-600">{packageSale.customerPhone}</p>
                    </div>
                    <Badge className={getStatusBadge(packageSale.status)}>
                      {packageSale.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {packageSale.remainingHours}/{packageSale.totalHours} hours left
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Valid until {new Date(packageSale.validTill).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPackageSale(packageSale);
                    setUsageDialogOpen(true);
                  }}
                >
                  Record Usage
                </Button>
              </div>
            ))}
            {activePackages.length === 0 && (
              <p className="text-center text-gray-500 py-8">No active packages found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Recording Dialog */}
      <Dialog open={usageDialogOpen} onOpenChange={setUsageDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Record Package Usage</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Record hours used for {selectedPackageSale?.customerName}
            </DialogDescription>
          </DialogHeader>
          {selectedPackageSale && (
            <form onSubmit={handleRecordUsage} className="space-y-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg border">
                <p className="text-sm font-medium text-blue-900">Package Details</p>
                <p className="text-sm text-blue-700 mt-1">
                  Customer: {selectedPackageSale.customerName}
                </p>
                <p className="text-sm text-blue-700">
                  Remaining: {selectedPackageSale.remainingHours} hours
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hoursUsed" className="text-sm font-medium">Hours to Use</Label>
                <Input 
                  name="hoursUsed" 
                  type="number" 
                  min="1" 
                  max={selectedPackageSale.remainingHours}
                  placeholder="1"
                  required 
                />
                <p className="text-xs text-gray-500">Max: {selectedPackageSale.remainingHours} hours</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numberOfChildren" className="text-sm font-medium">Number of Children</Label>
                <Input name="numberOfChildren" type="number" min="1" defaultValue="1" placeholder="1" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="childrenNames" className="text-sm font-medium">Children Names (comma separated)</Label>
                <Input name="childrenNames" placeholder="Child 1, Child 2, Child 3" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supervisorNotes" className="text-sm font-medium">Supervisor Notes</Label>
                <Textarea name="supervisorNotes" rows={2} placeholder="Any observations or special notes..." />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-toodles-primary hover:bg-toodles-primary/90 text-white"
                disabled={recordUsageMutation.isPending}
              >
                {recordUsageMutation.isPending ? "Recording Usage..." : "Record Usage"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* All Package Sales */}
      <Card>
        <CardHeader>
          <CardTitle>All Package Sales</CardTitle>
          <CardDescription>Complete history of package sales</CardDescription>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <p className="text-center py-8">Loading package sales...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Hours</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Valid Until</th>
                    <th className="text-left p-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {packageSales.map((sale) => (
                    <tr key={sale.id} className="border-b">
                      <td className="p-2">#{sale.id}</td>
                      <td className="p-2">{sale.customerName}</td>
                      <td className="p-2">{sale.customerPhone}</td>
                      <td className="p-2">{sale.remainingHours}/{sale.totalHours}</td>
                      <td className="p-2">₹{sale.totalAmount}</td>
                      <td className="p-2">
                        <Badge className={getStatusBadge(sale.status)}>
                          {sale.status}
                        </Badge>
                      </td>
                      <td className="p-2">{new Date(sale.validTill).toLocaleDateString()}</td>
                      <td className="p-2">{new Date(sale.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {packageSales.length === 0 && (
                <p className="text-center text-gray-500 py-8">No package sales found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}