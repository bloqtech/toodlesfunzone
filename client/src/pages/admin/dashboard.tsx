import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Gift, 
  TrendingUp,
  Clock,
  Settings,
  BarChart3,
  MessageCircle
} from "lucide-react";

export default function AdminDashboard() {
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

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: recentBookings } = useQuery({
    queryKey: ["/api/admin/bookings"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: enquiries } = useQuery({
    queryKey: ["/api/admin/enquiries"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-toodles-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-toodles-primary mx-auto mb-4"></div>
          <p className="text-toodles-text font-accent">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  const dashboardStats = [
    {
      title: "Total Bookings",
      value: analytics?.bookings?.totalBookings || 0,
      icon: Calendar,
      color: "from-toodles-primary to-pink-400",
      trend: "+12%"
    },
    {
      title: "Revenue",
      value: `₹${analytics?.revenue?.totalRevenue || 0}`,
      icon: DollarSign,
      color: "from-toodles-secondary to-teal-400",
      trend: "+8%"
    },
    {
      title: "Active Users",
      value: analytics?.topCustomers?.length || 0,
      icon: Users,
      color: "from-toodles-accent to-orange-400",
      trend: "+15%"
    },
    {
      title: "Birthday Parties",
      value: recentBookings?.filter((b: any) => b.packageId === 4).length || 0,
      icon: Gift,
      color: "from-toodles-success to-green-400",
      trend: "+25%"
    }
  ];

  const quickActions = [
    { name: "View Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Enquiries", href: "/admin/enquiries", icon: MessageCircle }
  ];

  return (
    <div className="min-h-screen bg-toodles-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-display text-toodles-text">Admin Dashboard</h1>
              <p className="text-gray-600 font-accent">Welcome back, {user?.firstName || 'Admin'}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline">
                  View Website
                </Button>
              </Link>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="transform hover:scale-105 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                      <p className="text-2xl font-display text-toodles-text">{stat.value}</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-500">{stat.trend}</span>
                      </div>
                    </div>
                    <div className={`bg-gradient-to-r ${stat.color} text-white rounded-full p-3`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Admin Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-toodles-text font-display">Admin Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/bookings">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-toodles-primary/10 border-toodles-primary/30">
                  <Calendar className="h-6 w-6 text-toodles-primary" />
                  <span className="font-medium">Bookings</span>
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-toodles-secondary/10 border-toodles-secondary/30">
                  <BarChart3 className="h-6 w-6 text-toodles-secondary" />
                  <span className="font-medium">Analytics</span>
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-toodles-accent/10 border-toodles-accent/30">
                  <Users className="h-6 w-6 text-toodles-accent" />
                  <span className="font-medium">User Management</span>
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-toodles-success/10 border-toodles-success/30">
                <Settings className="h-6 w-6 text-toodles-success" />
                <span className="font-medium">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-display text-toodles-text">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Link key={index} href={action.href}>
                    <Button 
                      variant="outline" 
                      className="w-full h-20 flex-col space-y-2 hover:bg-toodles-primary hover:text-white"
                    >
                      <IconComponent className="h-6 w-6" />
                      <span className="text-sm">{action.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-display text-toodles-text">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings?.slice(0, 5).map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-toodles-text">{booking.parentName}</p>
                      <p className="text-sm text-gray-600">{booking.bookingDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-toodles-primary">₹{booking.totalAmount}</p>
                      <Badge 
                        variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                        className={
                          booking.status === 'confirmed' 
                            ? 'bg-toodles-success' 
                            : booking.status === 'pending'
                            ? 'bg-toodles-accent text-toodles-text'
                            : 'bg-red-500'
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Link href="/admin/bookings">
                  <Button variant="outline" className="w-full">
                    View All Bookings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Enquiries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-display text-toodles-text">Recent Enquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enquiries?.slice(0, 5).map((enquiry: any) => (
                  <div key={enquiry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-toodles-text">{enquiry.name}</p>
                      <p className="text-sm text-gray-600">{enquiry.type}</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={enquiry.status === 'responded' ? 'default' : 'secondary'}
                        className={
                          enquiry.status === 'responded' 
                            ? 'bg-toodles-success' 
                            : enquiry.status === 'pending'
                            ? 'bg-toodles-accent text-toodles-text'
                            : 'bg-gray-500'
                        }
                      >
                        {enquiry.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Link href="/admin/enquiries">
                  <Button variant="outline" className="w-full">
                    View All Enquiries
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
