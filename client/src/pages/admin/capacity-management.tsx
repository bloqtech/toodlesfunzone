import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, Users, Save, Edit, AlertCircle } from "lucide-react";

interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  isActive: boolean;
  createdAt: string;
}

export default function CapacityManagement() {
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [capacity, setCapacity] = useState<number>(20);
  const { toast } = useToast();

  const { data: timeSlots, isLoading } = useQuery({
    queryKey: ["/api/admin/time-slots"],
  });

  const updateCapacityMutation = useMutation({
    mutationFn: async ({ slotId, maxCapacity }: { slotId: number; maxCapacity: number }) => {
      const response = await apiRequest('PUT', `/api/admin/time-slots/${slotId}`, { maxCapacity });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Capacity Updated",
        description: "Time slot capacity has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/time-slots"] });
      setEditingSlot(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update capacity. Please try again.",
        variant: "destructive",
      });
    }
  });

  const toggleSlotStatusMutation = useMutation({
    mutationFn: async ({ slotId, isActive }: { slotId: number; isActive: boolean }) => {
      const response = await apiRequest('PUT', `/api/admin/time-slots/${slotId}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Time slot status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/time-slots"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  });

  const bulkUpdateCapacityMutation = useMutation({
    mutationFn: async (maxCapacity: number) => {
      const response = await apiRequest('PUT', `/api/admin/time-slots/bulk-capacity`, { maxCapacity });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bulk Update Complete",
        description: "All time slot capacities have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/time-slots"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update capacities. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEdit = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setCapacity(slot.maxCapacity);
  };

  const handleSave = () => {
    if (editingSlot) {
      updateCapacityMutation.mutate({ slotId: editingSlot.id, maxCapacity: capacity });
    }
  };

  const handleBulkUpdate = () => {
    bulkUpdateCapacityMutation.mutate(capacity);
  };

  const toggleSlotStatus = (slot: TimeSlot) => {
    toggleSlotStatusMutation.mutate({ slotId: slot.id, isActive: !slot.isActive });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Capacity Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage hourly capacity and time slot availability</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label className="text-gray-700 dark:text-gray-300">Bulk Update Capacity:</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 20)}
                  className="w-20 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
                <Button 
                  onClick={handleBulkUpdate}
                  disabled={bulkUpdateCapacityMutation.isPending}
                  className="bg-toodles-primary hover:bg-toodles-primary/80"
                >
                  Update All
                </Button>
              </div>
            </div>
          </div>

          {/* Operating Hours Info */}
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Operating Hours & Capacity Rules</h3>
              </div>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Toodles Funzone operates from 10:00 AM to 8:00 PM daily. Each time slot can accommodate a maximum number of children based on the capacity you set below. 
                Once capacity is reached for a time slot, new bookings will be blocked for that slot.
              </p>
            </CardContent>
          </Card>

          {/* Time Slots Grid */}
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Loading time slots...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {timeSlots?.map((slot: TimeSlot) => (
                <Card key={slot.id} className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${!slot.isActive ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-toodles-primary" />
                        <span className="text-gray-900 dark:text-white">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                      </div>
                      <Badge variant={slot.isActive ? "default" : "secondary"} className={slot.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}>
                        {slot.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Max Capacity:</span>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-toodles-secondary" />
                          <span className="font-semibold text-gray-900 dark:text-white">{slot.maxCapacity} kids</span>
                        </div>
                      </div>
                      
                      {editingSlot?.id === slot.id ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="1"
                              max="50"
                              value={capacity}
                              onChange={(e) => setCapacity(parseInt(e.target.value) || 20)}
                              className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                            <Button 
                              size="sm" 
                              onClick={handleSave}
                              disabled={updateCapacityMutation.isPending}
                              className="bg-toodles-success hover:bg-toodles-success/80"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditingSlot(null)}
                              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(slot)}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant={slot.isActive ? "destructive" : "default"}
                            onClick={() => toggleSlotStatus(slot)}
                            disabled={toggleSlotStatusMutation.isPending}
                            className={slot.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                          >
                            {slot.isActive ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Capacity Guidelines */}
          <Card className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Capacity Management Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recommended Capacities:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Peak Hours (4PM-7PM): 15-20 kids</li>
                    <li>Regular Hours: 20-25 kids</li>
                    <li>Off-Peak Hours: 25-30 kids</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Safety Considerations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Ensure adequate staff supervision</li>
                    <li>Consider age group distributions</li>
                    <li>Account for birthday party bookings</li>
                    <li>Maintain emergency evacuation paths</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}