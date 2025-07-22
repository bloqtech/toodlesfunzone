import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CustomerAuthForm } from "./customer-auth-form";
import { Calendar, Clock, Users, Package, CreditCard } from "lucide-react";

interface EnhancedBookingFormProps {
  packages: any[];
  timeSlots: any[];
  onSubmit: (bookingData: any) => void;
  isLoading?: boolean;
}

export function EnhancedBookingForm({ packages, timeSlots, onSubmit, isLoading }: EnhancedBookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Booking form data
  const [bookingData, setBookingData] = useState({
    packageId: "",
    timeSlotId: "",
    bookingDate: "",
    numberOfChildren: 1,
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    childrenAges: [] as number[],
    specialRequests: "",
    createAccount: false,
    guestPassword: "",
  });

  const handlePackageSelect = (packageId: string) => {
    setBookingData({ ...bookingData, packageId });
    setCurrentStep(2);
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    setBookingData({ ...bookingData, timeSlotId });
    setCurrentStep(3);
  };

  const handleDateSelect = (date: string) => {
    setBookingData({ ...bookingData, bookingDate: date });
    setCurrentStep(4);
  };

  const handleParentInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingData.parentName || !bookingData.parentEmail || !bookingData.parentPhone) {
      toast({
        title: "Error",
        description: "Please fill in all parent information",
        variant: "destructive",
      });
      return;
    }

    setShowAuthOptions(true);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setShowAuthOptions(false);
    setCurrentStep(5);
  };

  const handleGuestContinue = () => {
    setShowAuthOptions(false);
    setCurrentStep(5);
  };

  const handleFinalSubmit = () => {
    const selectedPackage = packages.find(p => p.id.toString() === bookingData.packageId);
    
    const finalBookingData = {
      ...bookingData,
      totalAmount: selectedPackage?.price || 0,
      userId: user?.id || null,
      createAccount: bookingData.createAccount && !user,
    };

    onSubmit(finalBookingData);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Select Package";
      case 2: return "Choose Time Slot";
      case 3: return "Pick Date";
      case 4: return "Parent Information";
      case 5: return "Review & Confirm";
      default: return "Booking";
    }
  };

  if (showAuthOptions) {
    return (
      <CustomerAuthForm
        onAuthSuccess={handleAuthSuccess}
        onGuestContinue={handleGuestContinue}
        parentName={bookingData.parentName}
        parentEmail={bookingData.parentEmail}
        parentPhone={bookingData.parentPhone}
      />
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-display text-toodles-text text-center">
          {getStepTitle()}
        </CardTitle>
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step <= currentStep
                    ? "bg-toodles-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Step 1: Package Selection */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Package className="h-5 w-5 text-toodles-primary mr-2" />
              <h3 className="text-lg font-accent font-semibold">Choose Your Package</h3>
            </div>
            <div className="grid gap-4">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-toodles-primary"
                  onClick={() => handlePackageSelect(pkg.id.toString())}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display text-lg text-toodles-text">{pkg.name}</h4>
                        <p className="text-gray-600 font-accent">{pkg.description}</p>
                        <p className="text-sm text-gray-500 mt-1">Duration: {pkg.duration} hours</p>
                        <p className="text-sm text-gray-500">Max Children: {pkg.maxChildren}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-toodles-primary">₹{pkg.price}</p>
                        <p className="text-sm text-gray-500 capitalize">{pkg.type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Time Slot Selection */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-toodles-primary mr-2" />
              <h3 className="text-lg font-accent font-semibold">Select Time Slot</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {timeSlots.map((slot) => (
                <Card
                  key={slot.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-toodles-secondary"
                  onClick={() => handleTimeSlotSelect(slot.id.toString())}
                >
                  <CardContent className="p-4 text-center">
                    <h4 className="font-display text-lg text-toodles-text">
                      {slot.startTime} - {slot.endTime}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Capacity: {slot.maxCapacity} children
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="w-full"
            >
              Back to Packages
            </Button>
          </div>
        )}

        {/* Step 3: Date Selection */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-toodles-primary mr-2" />
              <h3 className="text-lg font-accent font-semibold">Choose Date</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-date">Booking Date</Label>
              <Input
                id="booking-date"
                type="date"
                value={bookingData.bookingDate}
                onChange={(e) => handleDateSelect(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="w-full"
            >
              Back to Time Slots
            </Button>
          </div>
        )}

        {/* Step 4: Parent Information */}
        {currentStep === 4 && (
          <form onSubmit={handleParentInfoSubmit} className="space-y-4">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-toodles-primary mr-2" />
              <h3 className="text-lg font-accent font-semibold">Parent & Children Information</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parent-name">Parent/Guardian Name</Label>
              <Input
                id="parent-name"
                type="text"
                value={bookingData.parentName}
                onChange={(e) => setBookingData({...bookingData, parentName: e.target.value})}
                placeholder="Enter parent/guardian name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent-email">Email Address</Label>
              <Input
                id="parent-email"
                type="email"
                value={bookingData.parentEmail}
                onChange={(e) => setBookingData({...bookingData, parentEmail: e.target.value})}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent-phone">Phone Number</Label>
              <Input
                id="parent-phone"
                type="tel"
                value={bookingData.parentPhone}
                onChange={(e) => setBookingData({...bookingData, parentPhone: e.target.value})}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number-of-children">Number of Children</Label>
              <Select 
                value={bookingData.numberOfChildren.toString()} 
                onValueChange={(value) => setBookingData({...bookingData, numberOfChildren: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of children" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Child' : 'Children'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special-requests">Special Requests (Optional)</Label>
              <Textarea
                id="special-requests"
                value={bookingData.specialRequests}
                onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                placeholder="Any special requirements or requests..."
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(3)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-toodles-primary hover:bg-toodles-primary/90"
              >
                Continue
              </Button>
            </div>
          </form>
        )}

        {/* Step 5: Review & Confirm */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <CreditCard className="h-5 w-5 text-toodles-primary mr-2" />
              <h3 className="text-lg font-accent font-semibold">Review Your Booking</h3>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Package:</span>
                <span>{packages.find(p => p.id.toString() === bookingData.packageId)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{bookingData.bookingDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time:</span>
                <span>
                  {timeSlots.find(t => t.id.toString() === bookingData.timeSlotId)?.startTime} - 
                  {timeSlots.find(t => t.id.toString() === bookingData.timeSlotId)?.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Children:</span>
                <span>{bookingData.numberOfChildren}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Parent:</span>
                <span>{bookingData.parentName}</span>
              </div>
              {user && (
                <div className="flex justify-between">
                  <span className="font-medium">Account:</span>
                  <span className="text-green-600">Logged in as {user.firstName}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-toodles-primary">
                  ₹{packages.find(p => p.id.toString() === bookingData.packageId)?.price}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(4)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleFinalSubmit}
                disabled={isLoading}
                className="flex-1 bg-toodles-success hover:bg-toodles-success/90"
              >
                {isLoading ? "Processing..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}