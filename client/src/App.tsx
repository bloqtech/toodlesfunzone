import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// Removed Replit Auth - using Google OAuth now
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { usePerformanceTracking } from "./hooks/use-performance";

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
import AdminCapacity from "@/pages/admin/capacity-management";
import AdminOperatingHours from "@/pages/admin/operating-hours";
import AdminAddOns from "@/pages/admin/addons-management";
import { PackageManagement } from "@/pages/admin/package-management";
import AdminLoginPage from "@/pages/admin-login";
import AuthPage from "@/pages/auth";
import { LoginPage } from "@/pages/login";
import { AdminAccessDot } from "@/components/admin/admin-access-dot";
import { BrowserRouter } from "react-router-dom";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  // Track performance metrics
  usePerformanceTracking();

  return (
    <Switch>
      {/* Public routes available to all users */}
      <Route path="/" component={Landing} />
      <Route path="/activities" component={Activities} />
      <Route path="/packages" component={Packages} />
      <Route path="/birthday" component={Birthday} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/contact" component={Contact} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={LoginPage} />
      
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/bookings" component={AdminBookings} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/packages" component={AdminPackages} />
      <Route path="/admin/activities" component={AdminActivities} />
      <Route path="/admin/gallery" component={AdminGallery} />
      <Route path="/admin/birthday" component={AdminBirthday} />
      <Route path="/admin/capacity" component={AdminCapacity} />
      <Route path="/admin/operating-hours" component={AdminOperatingHours} />
      <Route path="/admin/add-ons" component={AdminAddOns} />
      <Route path="/admin/package-management" component={PackageManagement} />
      <Route path="/admin/enquiries" component={() => <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="text-center"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Enquiry Management</h1><p className="text-gray-600 dark:text-gray-400">Coming soon! Contact forms are being collected.</p></div></div>} />
      
      {/* Test routes */}
      <Route path="/test/operating-hours" component={AdminOperatingHours} />
      
      {/* 404 page */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
          <Toaster />
          <Router />
        <AdminAccessDot />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
