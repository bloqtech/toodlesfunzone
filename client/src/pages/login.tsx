import { WhatsAppAuth } from "@/components/auth/whatsapp-auth";

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-toodles-primary/10 via-toodles-secondary/10 to-toodles-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-toodles-primary font-display">
            Welcome to Toodles Funzone
          </h1>
          <p className="text-toodles-text/70 mt-2">
            Login to book your fun activities!
          </p>
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