import { Link } from "wouter";
import { WhatsAppAuth } from "@/components/auth/whatsapp-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-toodles-primary/10 via-toodles-secondary/10 to-toodles-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-toodles-primary font-display">
            Welcome to Toodles Funzone
          </h1>
          <p className="text-toodles-text/70 mt-2">
            Login to manage bookings, or book as a guest
          </p>
        </div>

        {/* Guest booking - no login required */}
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-toodles-text mb-2">
              You don’t need to log in to book
            </p>
            <p className="text-sm text-toodles-text/70 mb-4">
              Click below to go to the home page, then use <strong>Book Now</strong> to choose a package and pay. You’ll get confirmation by email.
            </p>
            <Link href="/">
              <Button className="w-full bg-toodles-accent hover:bg-toodles-accent/90 text-white font-accent font-bold">
                <User className="h-4 w-4 mr-2" />
                Continue as Guest — Book Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[length:100%_2rem] bg-toodles-primary/10 px-2 text-toodles-text/60">Or login with WhatsApp</span>
          </div>
        </div>
        
        <WhatsAppAuth />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-toodles-text/60">
            By logging in, you agree to our{" "}
            <a href="/terms" className="text-toodles-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-toodles-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}