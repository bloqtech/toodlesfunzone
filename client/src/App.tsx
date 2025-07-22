import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Activities from "@/pages/activities";
import Packages from "@/pages/packages";
import Birthday from "@/pages/birthday";
import Gallery from "@/pages/gallery";
import Contact from "@/pages/contact";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminBookings from "@/pages/admin/bookings";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminUsers from "@/pages/admin/users-advanced";
import AdminPackages from "@/pages/admin/packages";
import AdminActivities from "@/pages/admin/activities-management";
import AdminGallery from "@/pages/admin/gallery-management";
import AdminBirthday from "@/pages/admin/birthday-management";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/activities" component={Activities} />
          <Route path="/packages" component={Packages} />
          <Route path="/birthday" component={Birthday} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/contact" component={Contact} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/activities" component={Activities} />
          <Route path="/packages" component={Packages} />
          <Route path="/birthday" component={Birthday} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/contact" component={Contact} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/bookings" component={AdminBookings} />
          <Route path="/admin/analytics" component={AdminAnalytics} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/packages" component={AdminPackages} />
          <Route path="/admin/activities" component={AdminActivities} />
          <Route path="/admin/gallery" component={AdminGallery} />
          <Route path="/admin/birthday" component={AdminBirthday} />
          <Route path="/admin/enquiries" component={() => <div className="min-h-screen bg-toodles-background flex items-center justify-center"><div className="text-center"><h1 className="text-3xl font-bold text-toodles-text font-display mb-4">Enquiry Management</h1><p className="text-toodles-text/70">Coming soon! Contact forms are being collected.</p></div></div>} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
