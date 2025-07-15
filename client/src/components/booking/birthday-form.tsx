import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Gift, Calendar, Users, Cake, Star } from "lucide-react";

interface BirthdayFormProps {
  onClose: () => void;
}

export function BirthdayForm({ onClose }: BirthdayFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    partyDate: '',
    timeSlotId: '',
    numberOfGuests: '',
    theme: '',
    cakePreference: '',
    decorationPreference: '',
    specialRequests: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    packageType: 'deluxe' // default to deluxe package
  });

  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: timeSlots } = useQuery({
    queryKey: ["/api/time-slots"],
  });

  const birthdayMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!isAuthenticated) {
        window.location.href = '/api/login';
        return;
      }
      const response = await apiRequest('POST', '/api/birthday-parties', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Birthday Party Booked!",
        description: "Your magical birthday party has been booked successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/birthday-parties"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: "Failed to book birthday party. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    const packagePrices = {
      starter: 2999,
      deluxe: 4999,
      ultimate: 7999
    };

    const partyData = {
      ...formData,
      childAge: parseInt(formData.childAge),
      timeSlotId: parseInt(formData.timeSlotId),
      numberOfGuests: parseInt(formData.numberOfGuests),
      totalAmount: packagePrices[formData.packageType as keyof typeof packagePrices]
    };

    birthdayMutation.mutate(partyData);
  };

  const themes = [
    "Princess Palace",
    "Superhero Adventure", 
    "Jungle Safari",
    "Space Explorer",
    "Underwater Kingdom",
    "Rainbow Unicorn"
  ];

  const cakeOptions = [
    "Chocolate Cake",
    "Vanilla Cake",
    "Strawberry Cake",
    "Custom Theme Cake"
  ];

  const packages = [
    {
      id: 'starter',
      name: 'Magic Starter',
      price: 2999,
      duration: 2,
      guests: 10,
      features: ['2-hour party slot', 'Themed decorations', 'Birthday cake (1kg)', 'Basic photography']
    },
    {
      id: 'deluxe',
      name: 'Deluxe Celebration',
      price: 4999,
      duration: 3,
      guests: 15,
      features: ['3-hour party slot', 'Premium decorations', 'Birthday cake (2kg)', 'Magic show', 'Professional photography'],
      popular: true
    },
    {
      id: 'ultimate',
      name: 'Ultimate Extravaganza',
      price: 7999,
      duration: 4,
      guests: 20,
      features: ['4-hour party slot', 'Luxury decorations', 'Custom cake (3kg)', 'Live entertainment', 'Full meal service']
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-display text-toodles-text">
            Book Birthday Party
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Package Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-toodles-primary text-white rounded-full mr-3">
                  <span className="text-sm font-bold">1</span>
                </div>
                <h3 className="text-lg font-display text-toodles-text">Choose Package</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all relative ${
                      formData.packageType === pkg.id
                        ? 'border-toodles-primary bg-toodles-primary bg-opacity-10'
                        : 'border-gray-200 hover:border-toodles-primary'
                    }`}
                    onClick={() => handleChange('packageType', pkg.id)}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-2 -right-2 bg-toodles-secondary text-white text-xs px-2 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-display text-toodles-text">{pkg.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{pkg.duration} hours • Up to {pkg.guests} guests</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center">
                              <Star className="h-3 w-3 text-toodles-success mr-1" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-display text-toodles-primary">₹{pkg.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={() => setStep(2)} 
                disabled={!formData.packageType}
                className="w-full bg-toodles-primary hover:bg-red-600 text-white"
              >
                Next: Party Details
              </Button>
            </div>
          )}

          {/* Step 2: Party Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-toodles-primary text-white rounded-full mr-3">
                  <span className="text-sm font-bold">2</span>
                </div>
                <h3 className="text-lg font-display text-toodles-text">Party Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="childName">Birthday Child's Name</Label>
                  <Input
                    id="childName"
                    value={formData.childName}
                    onChange={(e) => handleChange('childName', e.target.value)}
                    placeholder="Enter child's name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="childAge">Child's Age</Label>
                  <Select value={formData.childAge} onValueChange={(value) => handleChange('childAge', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 7, 8].map((age) => (
                        <SelectItem key={age} value={age.toString()}>{age} years</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="partyDate">Party Date</Label>
                  <Input
                    id="partyDate"
                    type="date"
                    value={formData.partyDate}
                    onChange={(e) => handleChange('partyDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <Label htmlFor="timeSlot">Time Slot</Label>
                  <Select value={formData.timeSlotId} onValueChange={(value) => handleChange('timeSlotId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots?.map((slot: any) => (
                        <SelectItem key={slot.id} value={slot.id.toString()}>
                          {slot.startTime} - {slot.endTime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="numberOfGuests">Number of Guests</Label>
                <Select value={formData.numberOfGuests} onValueChange={(value) => handleChange('numberOfGuests', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of guests" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 25 }, (_, i) => i + 5).map((num) => (
                      <SelectItem key={num} value={num.toString()}>{num} guests</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme">Party Theme</Label>
                  <Select value={formData.theme} onValueChange={(value) => handleChange('theme', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((theme) => (
                        <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="cakePreference">Cake Preference</Label>
                  <Select value={formData.cakePreference} onValueChange={(value) => handleChange('cakePreference', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cake type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cakeOptions.map((cake) => (
                        <SelectItem key={cake} value={cake}>{cake}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="decorationPreference">Decoration Preference</Label>
                <Input
                  id="decorationPreference"
                  value={formData.decorationPreference}
                  onChange={(e) => handleChange('decorationPreference', e.target.value)}
                  placeholder="Any specific decoration requests..."
                />
              </div>
              
              <div>
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => handleChange('specialRequests', e.target.value)}
                  placeholder="Any special requests or requirements..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setStep(1)} 
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  disabled={!formData.childName || !formData.childAge || !formData.partyDate || !formData.timeSlotId || !formData.numberOfGuests}
                  className="flex-1 bg-toodles-primary hover:bg-red-600 text-white"
                >
                  Next: Contact Details
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-toodles-primary text-white rounded-full mr-3">
                  <span className="text-sm font-bold">3</span>
                </div>
                <h3 className="text-lg font-display text-toodles-text">Contact Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parentName">Parent Name</Label>
                  <Input
                    id="parentName"
                    value={formData.parentName}
                    onChange={(e) => handleChange('parentName', e.target.value)}
                    placeholder="Enter parent name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="parentPhone">Phone Number</Label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => handleChange('parentPhone', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="parentEmail">Email Address</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleChange('parentEmail', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              
              {/* Party Summary */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-display text-toodles-text mb-3">Party Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Package:</span>
                      <span className="font-medium">{packages.find(p => p.id === formData.packageType)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Child:</span>
                      <span className="font-medium">{formData.childName} (Age {formData.childAge})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">{formData.partyDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Guests:</span>
                      <span className="font-medium">{formData.numberOfGuests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Theme:</span>
                      <span className="font-medium">{formData.theme}</span>
                    </div>
                    <div className="flex justify-between text-lg font-display text-toodles-primary border-t pt-2">
                      <span>Total:</span>
                      <span>₹{packages.find(p => p.id === formData.packageType)?.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setStep(2)} 
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.parentName || !formData.parentPhone || !formData.parentEmail || birthdayMutation.isPending}
                  className="flex-1 bg-toodles-primary hover:bg-red-600 text-white"
                >
                  {birthdayMutation.isPending ? 'Booking...' : (
                    <>
                      <Gift className="h-4 w-4 mr-2" />
                      Book Party
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
