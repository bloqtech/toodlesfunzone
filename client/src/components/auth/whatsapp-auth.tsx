import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Smartphone, CheckCircle } from "lucide-react";

interface WhatsAppAuthProps {
  onSuccess?: (user: any) => void;
  mode?: "login" | "booking";
  title?: string;
  description?: string;
}

export function WhatsAppAuth({ onSuccess, mode = "login", title, description }: WhatsAppAuthProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const { toast } = useToast();

  const sendOTP = async () => {
    if (!phone.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setStep("otp");
        // Show dev OTP in development mode
        if (data.devOtp) {
          toast({
            title: "OTP Sent! (Dev Mode)",
            description: `Your OTP is: ${data.devOtp}`,
            duration: 10000, // Show longer in dev mode
          });
        } else {
          toast({
            title: "OTP Sent!",
            description: "Please check your WhatsApp for the verification code",
          });
        }
      } else {
        throw new Error(data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      toast({
        title: "Error sending OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    if (isNewUser && (!firstName.trim() || !lastName.trim())) {
      toast({
        title: "Name required",
        description: "Please enter your first and last name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: phone.trim(), 
          otp,
          firstName: firstName.trim(),
          lastName: lastName.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Login Successful!",
          description: "Welcome to Toodles Funzone",
        });
        
        if (onSuccess) {
          onSuccess(data.user);
        } else {
          window.location.reload();
        }
      } else {
        throw new Error(data.message || "Failed to verify OTP");
      }
    } catch (error: any) {
      if (error.message?.includes("Invalid or expired")) {
        toast({
          title: "OTP Expired",
          description: "Please request a new OTP",
          variant: "destructive",
        });
        setStep("phone");
        setOtp("");
      } else {
        toast({
          title: "Verification failed",
          description: error.message || "Please try again",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 10 digits for Indian mobile numbers
    const truncated = cleaned.slice(0, 10);
    
    // Format as xxx-xxx-xxxx
    if (truncated.length >= 6) {
      return `${truncated.slice(0, 3)}-${truncated.slice(3, 6)}-${truncated.slice(6)}`;
    } else if (truncated.length >= 3) {
      return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
    }
    return truncated;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          {step === "phone" ? (
            <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
          ) : (
            <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold">
          {title || (step === "phone" ? "Login with WhatsApp" : "Enter OTP")}
        </CardTitle>
        <CardDescription>
          {description || (step === "phone" 
            ? "Enter your mobile number to receive OTP via WhatsApp" 
            : "We've sent a 6-digit code to your WhatsApp")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === "phone" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="999-012-3456"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="pl-12"
                  maxLength={12} // xxx-xxx-xxxx format
                />
              </div>
              <p className="text-xs text-gray-500">
                Enter your 10-digit mobile number without +91
              </p>
            </div>

            <Button 
              onClick={sendOTP} 
              disabled={isLoading || !phone.replace(/\D/g, '').length}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </Button>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MessageCircle className="h-4 w-4" />
              <span>You'll receive OTP on WhatsApp</span>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Enter 6-digit OTP</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-center text-gray-500">
                  Sent to +91 {phone.replace(/\D/g, '')}
                </p>
              </div>

              {isNewUser && (
                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Welcome! Please enter your name to complete registration:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                onClick={verifyOTP} 
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setIsNewUser(false);
                }}
                className="w-full"
              >
                Change Phone Number
              </Button>
            </div>

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={sendOTP}
                disabled={isLoading}
                className="text-sm"
              >
                Didn't receive OTP? Resend
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}