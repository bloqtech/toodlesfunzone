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
import { X, Calendar, Clock, Users, CreditCard, Gift } from "lucide-react";

interface BookingModalProps {
  onClose: () => void;
  packages: any[];
}

export function BookingModal({ onClose, packages }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    packageId: '',
    timeSlotId: '',
    bookingDate: '',
    numberOfChildren: 1,
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    childrenAges: [] as number[],
    specialRequests: '',
    voucherCode: ''
  });
  const [availability, setAvailability] = useState<any>(null);
  const [voucher, setVoucher] = useState<any>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: timeSlots } = useQuery({
    queryKey: ["/api/time-slots", formData.bookingDate],
    queryFn: async () => {
      const url = formData.bookingDate ? 
        `/api/time-slots?date=${formData.bookingDate}` : 
        '/api/time-slots';
      const response = await fetch(url);
      return response.json();
    },
    enabled: !!formData.bookingDate,
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!isAuthenticated) {
        window.location.href = '/api/login';
        return;
      }
      const response = await apiRequest('POST', '/api/bookings', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "Your play session has been booked successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  const checkAvailability = async () => {
    if (!formData.bookingDate || !formData.timeSlotId) return;
    
    try {
      const response = await fetch(`/api/availability/${formData.bookingDate}/${formData.timeSlotId}`);
      const data = await response.json();
      setAvailability(data);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const checkVoucher = async () => {
    if (!formData.voucherCode) return;
    
    try {
      const response = await fetch(`/api/voucher/${formData.voucherCode}`);
      if (response.ok) {
        const data = await response.json();
        setVoucher(data);
        toast({
          title: "Voucher Applied!",
          description: `${data.discountType === 'percentage' ? data.discountValue + '%' : '₹' + data.discountValue} discount applied.`,
        });
      } else {
        setVoucher(null);
        toast({
          title: "Invalid Voucher",
          description: "The voucher code is invalid or expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking voucher:', error);
    }
  };

  const calculateTotal = () => {
    const selectedPackage = packages.find(p => p.id === parseInt(formData.packageId));
    if (!selectedPackage) return 0;

    let baseAmount = parseFloat(selectedPackage.price) * formData.numberOfChildren;
    
    if (voucher) {
      if (voucher.discountType === 'percentage') {
        const discount = (baseAmount * voucher.discountValue) / 100;
        baseAmount -= Math.min(discount, voucher.maxDiscount || discount);
      } else {
        baseAmount -= voucher.discountValue;
      }
    }
    
    return Math.max(baseAmount, 0);
  };

  const handleSubmit = () => {
    const selectedPackage = packages.find(p => p.id === parseInt(formData.packageId));
    const calculatedTotal = calculateTotal();
    
    const bookingData = {
      ...formData,
      packageId: parseInt(formData.packageId),
      timeSlotId: parseInt(formData.timeSlotId),
      totalAmount: calculatedTotal,
      childrenAges: formData.childrenAges.slice(0, formData.numberOfChildren)
    };

    bookingMutation.mutate(bookingData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChildrenAgeChange = (index: number, age: number) => {
    const newAges = [...formData.childrenAges];
    newAges[index] = age;
    setFormData(prev => ({
      ...prev,
      childrenAges: newAges
    }));
  };

  const selectedPackage = packages.find(p => p.id === parseInt(formData.packageId));
  const selectedTimeSlot = timeSlots?.find((t: any) => t.id === parseInt(formData.timeSlotId));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-display text-toodles-text">
            Book Your Play Session
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
                <h3 className="text-lg font-display text-toodles-text">Select Package</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.packageId === pkg.id.toString()
                        ? 'border-toodles-primary bg-toodles-primary bg-opacity-10'
                        : 'border-gray-200 hover:border-toodles-primary'
                    }`}
                    onClick={() => handleChange('packageId', pkg.id.toString())}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display text-toodles-text">{pkg.name}</h4>
                        <p className="text-sm text-gray-600">{pkg.description}</p>
                        <p className="text-sm text-gray-500 mt-1">{pkg.duration} hours</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-display text-toodles-primary">₹{pkg.price}</p>
                        <p className="text-sm text-gray-500">per child</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={() => setStep(2)} 
                disabled={!formData.packageId}
                className="w-full bg-toodles-primary hover:bg-red-600 text-white"
              >
                Next: Select Date & Time
              </Button>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-toodles-primary text-white rounded-full mr-3">
                  <span className="text-sm font-bold">2</span>
                </div>
                <h3 className="text-lg font-display text-toodles-text">Select Date & Time</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bookingDate">Booking Date</Label>
                  <Input
                    id="bookingDate"
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => handleChange('bookingDate', e.target.value)}
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
                          <div className="flex justify-between items-center w-full">
                            <span>
                              {new Date(`1970-01-01T${slot.startTime}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })} - {new Date(`1970-01-01T${slot.endTime}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                            {slot.availability && (
                              <span className={`text-xs ml-2 ${slot.availability.available ? 'text-green-600' : 'text-red-600'}`}>
                                {slot.availability.remaining > 0 ? 
                                  `${slot.availability.remaining} spots left` : 
                                  'Full'
                                }
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Show availability info if slot is selected */}
                  {selectedTimeSlot?.availability && (
                    <div className={`p-3 mt-2 rounded-lg ${selectedTimeSlot.availability.available ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {selectedTimeSlot.availability.available ? 
                            `${selectedTimeSlot.availability.remaining} spots available out of ${selectedTimeSlot.availability.capacity}` :
                            `Time slot is full (${selectedTimeSlot.availability.capacity}/${selectedTimeSlot.availability.capacity})`
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="numberOfChildren">Number of Children</Label>
                <Select value={formData.numberOfChildren.toString()} onValueChange={(value) => handleChange('numberOfChildren', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>{num} Child{num > 1 ? 'ren' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.bookingDate && formData.timeSlotId && (
                <Button 
                  onClick={checkAvailability}
                  variant="outline"
                  className="w-full"
                >
                  Check Availability
                </Button>
              )}

              {availability && (
                <div className={`p-4 rounded-lg ${availability.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`font-medium ${availability.available ? 'text-green-800' : 'text-red-800'}`}>
                    {availability.available 
                      ? `Available! ${availability.remainingCapacity} spots remaining.`
                      : availability.reason || 'This slot is not available.'
                    }
                  </p>
                </div>
              )}
              
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
                  disabled={!formData.bookingDate || !formData.timeSlotId || (availability && !availability.available)}
                  className="flex-1 bg-toodles-primary hover:bg-red-600 text-white"
                >
                  Next: Your Details
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Personal Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-toodles-primary text-white rounded-full mr-3">
                  <span className="text-sm font-bold">3</span>
                </div>
                <h3 className="text-lg font-display text-toodles-text">Your Details</h3>
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
              
              <div>
                <Label>Children Ages</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Array.from({ length: formData.numberOfChildren }, (_, index) => (
                    <div key={index}>
                      <Select 
                        value={formData.childrenAges[index]?.toString() || ''} 
                        onValueChange={(value) => handleChildrenAgeChange(index, parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Child ${index + 1} age`} />
                        </SelectTrigger>
                        <SelectContent>
                          {[2, 3, 4, 5, 6, 7, 8].map((age) => (
                            <SelectItem key={age} value={age.toString()}>{age} years</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => handleChange('specialRequests', e.target.value)}
                  placeholder="Any special requirements or requests..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setStep(2)} 
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(4)} 
                  disabled={!formData.parentName || !formData.parentPhone || !formData.parentEmail}
                  className="flex-1 bg-toodles-primary hover:bg-red-600 text-white"
                >
                  Next: Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-toodles-primary text-white rounded-full mr-3">
                  <span className="text-sm font-bold">4</span>
                </div>
                <h3 className="text-lg font-display text-toodles-text">Payment & Confirmation</h3>
              </div>
              
              {/* Booking Summary */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-display text-toodles-text mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Package:</span>
                      <span className="font-medium">{selectedPackage?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">{formData.bookingDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-medium">{selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Children:</span>
                      <span className="font-medium">{formData.numberOfChildren}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">₹{selectedPackage ? (parseFloat(selectedPackage.price) * formData.numberOfChildren) : 0}</span>
                    </div>
                    {voucher && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span className="font-medium">-₹{(selectedPackage ? (parseFloat(selectedPackage.price) * formData.numberOfChildren) : 0) - calculateTotal()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-display text-toodles-primary border-t pt-2">
                      <span>Total:</span>
                      <span>₹{calculateTotal()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Voucher Code */}
              <div className="flex gap-2">
                <Input
                  value={formData.voucherCode}
                  onChange={(e) => handleChange('voucherCode', e.target.value)}
                  placeholder="Enter voucher code"
                />
                <Button onClick={checkVoucher} variant="outline">
                  <Gift className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setStep(3)} 
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={bookingMutation.isPending}
                  className="flex-1 bg-toodles-primary hover:bg-red-600 text-white"
                >
                  {bookingMutation.isPending ? 'Processing...' : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay ₹{calculateTotal()}
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
