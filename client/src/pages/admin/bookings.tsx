import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar, 
  Users, 
  Phone, 
  Mail, 
  Filter,
  Search,
  Eye,
  Edit,
  ArrowLeft
} from "lucide-react";

export default function AdminBookings() {
  const [location, setLocation] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    
    if (!isLoading && isAuthenticated && !user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }
  }, [isAuthenticated, isLoading, user, toast, setLocation]);

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/admin/bookings"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const statusUpdateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/bookings/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  });

  const handleStatusUpdate = (id: number, status: string) => {
    statusUpdateMutation.mutate({ id, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-toodles-success text-white';
      case 'pending':
        return 'bg-toodles-accent text-toodles-text';
      case 'cancelled':
        return 'bg-red-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  const filteredBookings = bookings?.filter((booking: any) => {
    const matchesSearch = booking.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.parentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.parentPhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && new Date(booking.bookingDate).toDateString() === new Date().toDateString()) ||
                       (dateFilter === 'upcoming' && new Date(booking.bookingDate) > new Date());
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (isLoading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-toodles-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-toodles-primary mx-auto mb-4"></div>
          <p className="text-toodles-text font-accent">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-toodles-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/admin/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-display text-toodles-text">Bookings Management</h1>
                <p className="text-gray-600 font-accent">Manage all play session bookings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-toodles-primary text-white">
                {filteredBookings?.length || 0} bookings
              </Badge>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/api/logout'}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-display text-toodles-text flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-display text-toodles-text">
              All Bookings ({filteredBookings?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBookings?.map((booking: any) => (
                <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display text-lg text-toodles-text">
                          Booking #{booking.id}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status?.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-toodles-primary mr-2" />
                          <span>{booking.parentName}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-toodles-primary mr-2" />
                          <span>{booking.parentEmail}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-toodles-primary mr-2" />
                          <span>{booking.parentPhone}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-toodles-primary mr-2" />
                          <span>{booking.bookingDate}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Date:</span> {booking.bookingDate}
                        {booking.timeSlot && (
                          <> • <span className="font-medium">Time:</span> {booking.timeSlot.startTime} - {booking.timeSlot.endTime}</>
                        )}
                        {!booking.timeSlot && booking.timeSlotId && (
                          <> • <span className="font-medium">Time Slot ID:</span> {booking.timeSlotId}</>
                        )}
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Children:</span> {booking.numberOfChildren} • 
                        <span className="font-medium"> Amount:</span> ₹{booking.totalAmount} • 
                        <span className="font-medium"> Created:</span> {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                      
                      {booking.specialRequests && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Special Requests:</span> {booking.specialRequests}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Select 
                        value={booking.status} 
                        onValueChange={(value) => handleStatusUpdate(booking.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredBookings?.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No bookings found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
