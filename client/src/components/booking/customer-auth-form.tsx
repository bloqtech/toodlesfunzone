import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { User } from "lucide-react";

interface CustomerAuthFormProps {
  onAuthSuccess: (user: any) => void;
  onGuestContinue: () => void;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
}

export function CustomerAuthForm({ 
  onAuthSuccess, 
  onGuestContinue, 
  parentName, 
  parentEmail, 
  parentPhone 
}: CustomerAuthFormProps) {
  const [activeTab, setActiveTab] = useState("google");



  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-display text-toodles-text">
          Choose Your Booking Option
        </CardTitle>
        <p className="text-gray-600 font-accent">
          Continue as guest or create an account to manage bookings
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="google" className="font-accent">
              Sign in with Google
            </TabsTrigger>
            <TabsTrigger value="guest" className="font-accent">
              <User className="h-4 w-4 mr-2" />
              Guest
            </TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="space-y-4">
            <GoogleAuthButton
              onAuthSuccess={onAuthSuccess}
              showGuestOption={false}
              buttonText="Sign in with Google Account"
            />
            <div className="text-center text-sm text-gray-500 space-y-1">
              <p>✓ Quick and secure Google login</p>
              <p>✓ Manage your bookings easily</p>
              <p>✓ Access booking history</p>
            </div>
          </TabsContent>

          <TabsContent value="guest" className="space-y-4">
            <div className="text-center py-6">
              <h3 className="text-lg font-display text-toodles-text mb-2">
                Continue as Guest
              </h3>
              <p className="text-gray-600 mb-4 font-accent">
                Book now without creating an account. You'll receive booking confirmation via email and WhatsApp.
              </p>
              <ul className="text-sm text-gray-500 mb-6 space-y-1">
                <li>✓ Quick booking process</li>
                <li>✓ Email and WhatsApp confirmations</li>
                <li>✓ No password required</li>
              </ul>
              <Button
                onClick={onGuestContinue}
                className="w-full bg-toodles-accent hover:bg-toodles-accent/90 text-white font-accent font-bold"
              >
                Continue as Guest
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}