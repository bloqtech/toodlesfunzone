import { Switch, Route } from "wouter";
import { lazy } from "react";
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
          <Route path="/admin/users" component={lazy(() => import("./pages/admin/users"))} />
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
