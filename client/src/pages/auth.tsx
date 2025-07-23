import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Home } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check URL parameters for auth results
    const urlParams = new URLSearchParams(window.location.search);
    const authResult = urlParams.get('auth');
    
    if (authResult === 'success') {
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      });
      // Redirect to booking or dashboard
      setLocation('/');
    } else if (authResult === 'error') {
      const reason = urlParams.get('reason');
      let errorMessage = "There was an error signing in with Google.";
      
      if (reason === 'oauth_config') {
        errorMessage = "Google OAuth is temporarily unavailable. Please use guest mode or try again later.";
      }
      
      toast({
        title: "Authentication Temporarily Unavailable",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast, setLocation]);

  const handleAuthSuccess = (user: any) => {
    toast({
      title: "Welcome!",
      description: `Hello ${user.firstName}! You're now signed in.`,
    });
    setLocation('/');
  };

  const handleGuestContinue = () => {
    setLocation('/');
  };

  const handleBackToHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-toodles-primary via-toodles-secondary to-toodles-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBackToHome}
            className="bg-white/90 hover:bg-white text-gray-700 border-white/50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Authentication Card */}
        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-toodles-primary to-toodles-accent rounded-full flex items-center justify-center">
              <Home className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-display text-toodles-text">
              Welcome to Toodles
            </CardTitle>
            <p className="text-gray-600 font-accent text-lg">
              Your child's ultimate play destination
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notice about OAuth setup */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-sm text-amber-800 font-accent">
                <strong>Notice:</strong> Google sign-in is currently being configured. 
                <br />
                Please continue as a guest to access all booking features.
              </p>
            </div>

            <GoogleAuthButton
              onAuthSuccess={handleAuthSuccess}
              onGuestContinue={handleGuestContinue}
              showGuestOption={true}
              buttonText="Sign in with Google"
            />
            
            <div className="text-center text-sm text-gray-500 space-y-2">
              <p className="font-accent">
                Choose your preferred way to access our services
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-toodles-primary">With Google Account:</p>
                  <p>• Manage bookings</p>
                  <p>• View history</p>
                  <p>• Quick rebooking</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-toodles-accent">As Guest:</p>
                  <p>• Instant booking</p>
                  <p>• No registration</p>
                  <p>• Email confirmations</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 text-center text-white/90">
          <h3 className="text-xl font-display mb-4">What Awaits Your Child</h3>
          <div className="grid grid-cols-2 gap-4 text-sm font-accent">
            <div className="space-y-1">
              <p>🏰 Soft Play Zones</p>
              <p>🎮 Interactive Games</p>
            </div>
            <div className="space-y-1">
              <p>🎈 Birthday Parties</p>
              <p>🎯 Adventure Activities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}