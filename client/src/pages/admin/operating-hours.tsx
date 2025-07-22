import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, Calendar, Save, AlertCircle, CheckCircle } from "lucide-react";

interface OperatingHours {
  id: number;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

const DAYS_OF_WEEK = [
  { value: 0, name: 'Sunday', short: 'Sun' },
  { value: 1, name: 'Monday', short: 'Mon' },
  { value: 2, name: 'Tuesday', short: 'Tue' },
  { value: 3, name: 'Wednesday', short: 'Wed' },
  { value: 4, name: 'Thursday', short: 'Thu' },
  { value: 5, name: 'Friday', short: 'Fri' },
  { value: 6, name: 'Saturday', short: 'Sat' },
];

export default function OperatingHours() {
  const [operatingHours, setOperatingHours] = useState<{ [key: number]: { openTime: string; closeTime: string; isOpen: boolean } }>({});
  const { toast } = useToast();

  const { data: hours, isLoading } = useQuery({
    queryKey: ["/api/admin/operating-hours"],
    onSuccess: (data: OperatingHours[]) => {
      const hoursMap: { [key: number]: { openTime: string; closeTime: string; isOpen: boolean } } = {};
      
      // Initialize all days with default values
      DAYS_OF_WEEK.forEach(day => {
        hoursMap[day.value] = {
          openTime: "10:00",
          closeTime: "20:00",
          isOpen: day.value === 0 ? false : true // Default: closed on Sunday, open Mon-Sat
        };
      });
      
      // Override with actual data if exists
      data?.forEach((hour: OperatingHours) => {
        hoursMap[hour.dayOfWeek] = {
          openTime: hour.openTime.substring(0, 5), // Remove seconds
          closeTime: hour.closeTime.substring(0, 5), // Remove seconds
          isOpen: hour.isOpen
        };
      });
      
      setOperatingHours(hoursMap);
    }
  });

  const updateHoursMutation = useMutation({
    mutationFn: async (hoursData: { [key: number]: { openTime: string; closeTime: string; isOpen: boolean } }) => {
      const response = await apiRequest('PUT', '/api/admin/operating-hours', hoursData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Operating Hours Updated",
        description: "The operating hours have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/operating-hours"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update operating hours. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleTimeChange = (dayOfWeek: number, field: 'openTime' | 'closeTime', value: string) => {
    setOperatingHours(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value
      }
    }));
  };

  const handleToggleDay = (dayOfWeek: number, isOpen: boolean) => {
    setOperatingHours(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        isOpen
      }
    }));
  };

  const handleSave = () => {
    updateHoursMutation.mutate(operatingHours);
  };

  const formatTime = (time: string) => {
    if (!time) return '';
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Operating Hours</h1>
              <p className="text-gray-600 dark:text-gray-400">Define when Toodles Funzone is open for business</p>
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={updateHoursMutation.isPending}
              className="bg-toodles-primary hover:bg-toodles-primary/80"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateHoursMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {/* Operating Hours Guidelines */}
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Operating Hours Guidelines</h3>
              </div>
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">
                Set your weekly operating schedule. These hours determine when customers can make bookings and when time slots are available.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Important Notes:</strong>
                  <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 mt-1">
                    <li>Time slots will be automatically generated within these hours</li>
                    <li>Closed days won't accept any bookings</li>
                    <li>Changes affect future bookings, not existing ones</li>
                  </ul>
                </div>
                <div>
                  <strong>Typical Schedule:</strong>
                  <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 mt-1">
                    <li>Weekdays: 10:00 AM - 8:00 PM</li>
                    <li>Weekends: 9:00 AM - 9:00 PM</li>
                    <li>Consider maintenance days</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const dayHours = operatingHours[day.value] || { openTime: '10:00', closeTime: '20:00', isOpen: true };
              
              return (
                <Card key={day.value} className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${!dayHours.isOpen ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-toodles-primary" />
                        <span className="text-gray-900 dark:text-white">{day.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={dayHours.isOpen}
                          onCheckedChange={(checked) => handleToggleDay(day.value, checked)}
                        />
                        {dayHours.isOpen ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {dayHours.isOpen ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Opening Time</Label>
                          <Input
                            type="time"
                            value={dayHours.openTime}
                            onChange={(e) => handleTimeChange(day.value, 'openTime', e.target.value)}
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatTime(dayHours.openTime)}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Closing Time</Label>
                          <Input
                            type="time"
                            value={dayHours.closeTime}
                            onChange={(e) => handleTimeChange(day.value, 'closeTime', e.target.value)}
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatTime(dayHours.closeTime)}
                          </p>
                        </div>
                        
                        {dayHours.openTime && dayHours.closeTime && (
                          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-center">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Open Duration
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {(() => {
                                const [openH, openM] = dayHours.openTime.split(':').map(Number);
                                const [closeH, closeM] = dayHours.closeTime.split(':').map(Number);
                                const openMinutes = openH * 60 + openM;
                                const closeMinutes = closeH * 60 + closeM;
                                const durationMinutes = closeMinutes - openMinutes;
                                const hours = Math.floor(durationMinutes / 60);
                                const minutes = durationMinutes % 60;
                                return `${hours}h ${minutes}m`;
                              })()}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-red-600 dark:text-red-400 font-medium">Closed</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No bookings accepted</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Weekly Summary */}
          <Card className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Weekly Schedule Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Operating Days:</h4>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const dayHours = operatingHours[day.value];
                      return (
                        <span
                          key={day.value}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            dayHours?.isOpen
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {day.short}
                        </span>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Total Weekly Hours:</h4>
                  <p className="text-lg font-bold text-toodles-primary">
                    {(() => {
                      let totalMinutes = 0;
                      Object.entries(operatingHours).forEach(([dayNum, hours]) => {
                        if (hours.isOpen && hours.openTime && hours.closeTime) {
                          const [openH, openM] = hours.openTime.split(':').map(Number);
                          const [closeH, closeM] = hours.closeTime.split(':').map(Number);
                          const openMinutes = openH * 60 + openM;
                          const closeMinutes = closeH * 60 + closeM;
                          totalMinutes += closeMinutes - openMinutes;
                        }
                      });
                      const totalHours = Math.floor(totalMinutes / 60);
                      const remainingMinutes = totalMinutes % 60;
                      return `${totalHours}h ${remainingMinutes}m`;
                    })()}
                  </p>
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