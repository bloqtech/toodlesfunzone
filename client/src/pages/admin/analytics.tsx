import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Gift,
  ArrowLeft,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";

export default function AdminAnalytics() {
  const [location, setLocation] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

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

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/admin/analytics"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: bookings } = useQuery({
    queryKey: ["/api/admin/bookings"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  if (isLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-toodles-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-toodles-primary mx-auto mb-4"></div>
          <p className="text-toodles-text font-accent">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  const overviewStats = [
    {
      title: "Total Bookings",
      value: analytics?.bookings?.totalBookings || 0,
      icon: Calendar,
      color: "from-toodles-primary to-pink-400",
      change: "+12%",
      period: "vs last month"
    },
    {
      title: "Total Revenue",
      value: `₹${analytics?.revenue?.totalRevenue || 0}`,
      icon: DollarSign,
      color: "from-toodles-secondary to-teal-400",
      change: "+8%",
      period: "vs last month"
    },
    {
      title: "Active Customers",
      value: analytics?.topCustomers?.length || 0,
      icon: Users,
      color: "from-toodles-accent to-orange-400",
      change: "+15%",
      period: "vs last month"
    },
    {
      title: "Birthday Parties",
      value: bookings?.filter((b: any) => b.packageId === 4).length || 0,
      icon: Gift,
      color: "from-toodles-success to-green-400",
      change: "+25%",
      period: "vs last month"
    }
  ];

  const bookingStatusData = [
    { name: "Confirmed", value: analytics?.bookings?.confirmedBookings || 0, color: "hsl(152, 58%, 74%)" },
    { name: "Pending", value: analytics?.bookings?.pendingBookings || 0, color: "hsl(52, 100%, 68%)" },
    { name: "Cancelled", value: analytics?.bookings?.cancelledBookings || 0, color: "hsl(0, 84.2%, 60.2%)" }
  ];

  const monthlyRevenueData = analytics?.revenue?.monthlyRevenue || [];

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
                <h1 className="text-2xl font-display text-toodles-text">Analytics & Reports</h1>
                <p className="text-gray-600 font-accent">Business insights and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                Export Report
              </Button>
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
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="transform hover:scale-105 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                        <div className={`bg-gradient-to-r ${stat.color} text-white rounded-full p-2`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-display text-toodles-text mb-1">{stat.value}</p>
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-sm text-green-500 font-medium">{stat.change}</span>
                        <span className="text-sm text-gray-500 ml-1">{stat.period}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Booking Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-display text-toodles-text flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Booking Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookingStatusData.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <span className="text-sm font-medium text-toodles-text">{status.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-display text-toodles-text">{status.value}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({((status.value / (analytics?.bookings?.totalBookings || 1)) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-display text-toodles-text flex items-center">
                <LineChart className="h-5 w-5 mr-2" />
                Monthly Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyRevenueData.length > 0 ? (
                  monthlyRevenueData.map((month: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-lg font-display text-toodles-text">₹{month.revenue}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <p>No revenue data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Packages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-display text-toodles-text">
                Popular Packages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.popularPackages?.map((package_: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-toodles-text">Package #{package_.packageId}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-display text-toodles-primary">{package_.count}</span>
                      <span className="text-sm text-gray-500 ml-2">bookings</span>
                    </div>
                  </div>
                ))}
                {(!analytics?.popularPackages || analytics.popularPackages.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Gift className="h-8 w-8 mx-auto mb-2" />
                    <p>No package data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-display text-toodles-text">
                Top Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topCustomers?.slice(0, 5).map((customer: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-toodles-text">{customer.parentName}</p>
                      <p className="text-sm text-gray-600">{customer.parentEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-display text-toodles-primary">₹{customer.totalSpent}</p>
                      <p className="text-sm text-gray-500">{customer.bookingCount} bookings</p>
                    </div>
                  </div>
                ))}
                {(!analytics?.topCustomers || analytics.topCustomers.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p>No customer data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
