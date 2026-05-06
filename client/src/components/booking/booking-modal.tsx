import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Calendar,
  CalendarDays,
  Clock,
  Users,
  CreditCard,
  Gift,
  Loader2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { loadRazorpay, openRazorpayCheckout, formatAmount, RazorpayResponse } from "@/lib/razorpay";

interface BookingModalProps {
  onClose: () => void;
  packages: any[];
}

const STEPS = [
  { id: 1, label: "Package", icon: Gift },
  { id: 2, label: "Date & time", icon: CalendarDays },
  { id: 3, label: "Your details", icon: Users },
  { id: 4, label: "Payment", icon: CreditCard },
];

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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>('');

  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Lock background scroll while modal is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Fetch Razorpay key and load SDK
  useEffect(() => {
    const initializeRazorpay = async () => {
      try {
        const keyResponse = await fetch('/api/payment/key');
        if (keyResponse.ok) {
          const { keyId } = await keyResponse.json();
          setRazorpayKeyId(keyId);
        }
        await loadRazorpay();
        setRazorpayLoaded(true);
      } catch (error: any) {
        console.error('Failed to initialize Razorpay:', error);
        const msg = String(error?.message || '').toLowerCase();
        const isNetwork = msg.includes('fetch') || msg.includes('network') || msg.includes('load failed') || msg.includes('connection');
        toast({
          title: "Payment Error",
          description: isNetwork
            ? "Cannot reach the server. Make sure the app is running at http://localhost:5000."
            : "Failed to load payment gateway. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    initializeRazorpay();
  }, [toast]);

  const { data: timeSlots, isPending: timeSlotsLoading } = useQuery<any[]>({
    queryKey: ["/api/time-slots", formData.bookingDate],
    queryFn: async () => {
      const url = formData.bookingDate ?
        `/api/time-slots?date=${formData.bookingDate}` :
        '/api/time-slots';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch time slots');
      return response.json();
    },
    enabled: !!formData.bookingDate,
  });

  const checkAvailability = async () => {
    if (!formData.bookingDate || !formData.timeSlotId) return;

    try {
      const response = await fetch(`/api/availability/${formData.bookingDate}/${formData.timeSlotId}`);
      if (!response.ok) throw new Error('Failed to check availability');
      const data = await response.json();
      setAvailability(data);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast({
        title: "Availability Check Failed",
        description: "Could not check slot availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (formData.bookingDate && formData.timeSlotId) {
      checkAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.bookingDate, formData.timeSlotId]);

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/bookings/guest', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "Your play session has been booked successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-slots"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (data: { paymentId: string; orderId: string; signature: string; bookingId: number }) => {
      const response = await apiRequest('POST', '/api/payment/verify-booking', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Verified!",
        description: "Your booking is now confirmed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: () => {
      toast({
        title: "Payment Verification Failed",
        description: "Please contact support if payment was deducted.",
        variant: "destructive",
      });
    }
  });

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

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast({
        title: "Payment Gateway Not Ready",
        description: "Please wait for payment gateway to load.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.bookingDate || !formData.timeSlotId || !formData.packageId) {
      toast({
        title: "Missing Information",
        description: "Please complete all booking details.",
        variant: "destructive",
      });
      return;
    }

    if (availability && !availability.available) {
      toast({
        title: "Slot Not Available",
        description: "This time slot is no longer available. Please select another slot.",
        variant: "destructive",
      });
      return;
    }

    const spotsLeft = availability?.remaining ?? availability?.remainingCapacity ?? 0;
    if (formData.numberOfChildren > spotsLeft) {
      toast({
        title: "Not Enough Capacity",
        description: `Only ${spotsLeft} spots available.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const ping = await fetch('/api/payment/key', { method: 'GET', credentials: 'include' });
      if (!ping.ok) throw new Error('Server error');
    } catch (_) {
      toast({
        title: "Server Not Reachable",
        description: "Start the app first: in terminal run 'npm run dev', then open http://localhost:5000",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);
    const selectedPackage = packages.find(p => p.id === parseInt(formData.packageId));
    const calculatedTotal = calculateTotal();

    try {
      let orderResponse: Response;
      try {
        orderResponse = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            amount: calculatedTotal,
            currency: 'INR',
            receipt: `booking_${Date.now()}`,
          }),
        });
      } catch (networkError: any) {
        const msg = String(networkError?.message || '').toLowerCase();
        const isNetwork = msg.includes('fetch') || msg.includes('network') || msg.includes('load failed') || msg.includes('connection');
        if (isNetwork) {
          throw new Error('Cannot reach the server. Make sure the app is running at http://localhost:5000 and try again.');
        }
        throw networkError;
      }

      const contentType = orderResponse.headers.get('content-type');
      const isJson = contentType?.includes('application/json');
      const orderData = isJson ? await orderResponse.json() : { message: 'Server returned an invalid response' };
      if (!orderResponse.ok) {
        throw new Error(orderData?.message || 'Failed to create payment order');
      }
      const order = orderData;

      if (!razorpayKeyId) {
        throw new Error('Payment gateway not initialized');
      }

      openRazorpayCheckout({
        key: razorpayKeyId,
        amount: formatAmount(calculatedTotal),
        currency: 'INR',
        name: 'Toodles Funzone',
        description: `Booking for ${selectedPackage?.name || 'Play Session'}`,
        order_id: order.id,
        prefill: {
          name: formData.parentName,
          email: formData.parentEmail,
          contact: formData.parentPhone,
        },
        theme: {
          color: '#EF4444',
        },
        handler: async (response: RazorpayResponse) => {
          try {
            const bookingData = {
              ...formData,
              packageId: parseInt(formData.packageId),
              timeSlotId: parseInt(formData.timeSlotId),
              totalAmount: calculatedTotal,
              childrenAges: formData.childrenAges.slice(0, formData.numberOfChildren),
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              voucherCode: formData.voucherCode || undefined,
            };

            let lastErr: any;
            let booking: any;
            for (let attempt = 1; attempt <= 3; attempt++) {
              try {
                const bookingResponse = await apiRequest('POST', '/api/bookings/guest', bookingData);
                booking = await bookingResponse.json();
                lastErr = null;
                break;
              } catch (e) {
                lastErr = e;
                if (attempt < 3) await new Promise((r) => setTimeout(r, 1500));
              }
            }
            if (lastErr) throw lastErr;

            await verifyPaymentMutation.mutateAsync({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              bookingId: booking.id,
            });

            setIsProcessingPayment(false);
            toast({
              title: "Booking Confirmed!",
              description: `Your booking #${booking.id} is confirmed. See you at Toodles Funzone!`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
            queryClient.invalidateQueries({ queryKey: ["/api/time-slots"] });
            onClose();
          } catch (error: any) {
            setIsProcessingPayment(false);
            const msg = String(error?.message || "Failed to complete booking. Please contact support.");
            const msgLower = msg.toLowerCase();
            const isNetwork = msgLower.includes('fetch') || msgLower.includes('network') || msgLower.includes('load failed') || msgLower.includes('connection');
            const jsonMatch = msg.match(/\{\s*"message"\s*:\s*"([^"]+)"/);
            const description = isNetwork
              ? "We couldn't confirm the booking (connection issue). Your payment went through — please contact support with your payment details to get your booking confirmed."
              : (jsonMatch ? jsonMatch[1] : msg);
            toast({
              title: isNetwork ? "Connection Issue" : "Booking Failed",
              description,
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment. Your booking was not created.",
            });
          },
        },
      });
    } catch (error: any) {
      setIsProcessingPayment(false);
      const message = String(error?.message || "Failed to initialize payment. Please try again.");
      const msgLower = message.toLowerCase();
      const isNetworkError = msgLower.includes('fetch') || msgLower.includes('network') || msgLower.includes('load failed') || msgLower.includes('connection');
      toast({
        title: "Payment Error",
        description: isNetworkError
          ? "Cannot reach the server. Make sure the app is running at http://localhost:5000 and try again."
          : message,
        variant: "destructive",
      });
    }
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(20,14,30,0.55)] backdrop-blur-sm cursor-default"
      />

      <Card
        variant="default"
        className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-elev-lg p-0"
      >
        {/* Header */}
        <div className="relative bg-toodles-hero text-white px-6 py-5 sm:px-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 grid place-items-center h-8 w-8 rounded-full bg-white/15 hover:bg-white/30 transition-colors"
            aria-label="Close booking"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 id="booking-modal-title" className="text-2xl sm:text-3xl font-display leading-tight">
            Reserve your play session
          </h2>
          <p className="text-sm text-white/85 mt-1">
            A few simple steps and your slot is confirmed.
          </p>

          {/* Stepper */}
          <ol className="mt-5 grid grid-cols-4 gap-2">
            {STEPS.map((s) => {
              const isActive = step === s.id;
              const isDone = step > s.id;
              const Icon = s.icon;
              return (
                <li key={s.id} className="flex items-center gap-2 min-w-0">
                  <span
                    className={[
                      "grid place-items-center h-7 w-7 rounded-full text-xs font-bold shrink-0 transition-colors",
                      isDone
                        ? "bg-toodles-success text-white"
                        : isActive
                          ? "bg-white text-toodles-primary"
                          : "bg-white/20 text-white/80",
                    ].join(" ")}
                  >
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                  </span>
                  <span
                    className={[
                      "text-[11px] sm:text-xs font-medium truncate",
                      isActive ? "text-white" : "text-white/75",
                    ].join(" ")}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Body */}
        <CardContent className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5">
          {/* Step 1: Package Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-toodles-text">Choose a package</h3>
                <p className="text-sm text-muted-foreground">Every package includes full play-zone access and trained supervision.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {packages.map((pkg) => {
                  const selected = formData.packageId === pkg.id.toString();
                  return (
                    <button
                      type="button"
                      key={pkg.id}
                      onClick={() => handleChange('packageId', pkg.id.toString())}
                      className={[
                        "text-left rounded-2xl border-2 p-4 transition-all",
                        selected
                          ? "border-toodles-primary bg-toodles-primary/5 shadow-soft"
                          : "border-border hover:border-toodles-primary/60 hover:bg-muted/40",
                      ].join(" ")}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <h4 className="font-display text-toodles-text text-lg">{pkg.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            <Clock className="inline h-3 w-3 mr-1 -mt-0.5" />
                            {pkg.duration} hours
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-display text-gradient-sunset leading-none">₹{pkg.price}</p>
                          <p className="text-xs text-muted-foreground mt-1">per child</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-toodles-text">Pick a date and time</h3>
                <p className="text-sm text-muted-foreground">Availability updates live as you choose your slot.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bookingDate">Booking date</Label>
                  <Input
                    id="bookingDate"
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => handleChange('bookingDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="timeSlot">Time slot</Label>
                  <Select value={formData.timeSlotId} onValueChange={(value) => handleChange('timeSlotId', value)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots?.map((slot: any) => (
                        <SelectItem key={slot.id} value={slot.id.toString()}>
                          <div className="flex justify-between items-center w-full gap-3">
                            <span>
                              {new Date(`1970-01-01T${slot.startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} –{' '}
                              {new Date(`1970-01-01T${slot.endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                            {slot.availability && (
                              <span className={`text-xs ${slot.availability.available ? 'text-green-600' : 'text-red-600'}`}>
                                {slot.availability.remaining > 0 ? `${slot.availability.remaining} left` : 'Full'}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.bookingDate && !timeSlotsLoading && Array.isArray(timeSlots) && timeSlots.length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">No time slots available for this date. Try another date.</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="numberOfChildren">Number of children</Label>
                <Select value={formData.numberOfChildren.toString()} onValueChange={(value) => handleChange('numberOfChildren', parseInt(value))}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>{num} child{num > 1 ? 'ren' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {availability && (
                <div className={`rounded-2xl border p-4 ${availability.available ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {availability.available ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    {availability.available
                      ? `Available — ${availability.remainingCapacity || availability.remaining || 0} spots remaining`
                      : (availability.reason || 'This slot is not available.')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Personal Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-toodles-text">Tell us a bit about you</h3>
                <p className="text-sm text-muted-foreground">We'll send your booking confirmation to the phone number and email below.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parentName">Parent name</Label>
                  <Input
                    id="parentName"
                    value={formData.parentName}
                    onChange={(e) => handleChange('parentName', e.target.value)}
                    placeholder="Enter parent name"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="parentPhone">Phone number</Label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => handleChange('parentPhone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="parentEmail">Email address</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleChange('parentEmail', e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Children ages</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1.5">
                  {Array.from({ length: formData.numberOfChildren }, (_, index) => (
                    <Select
                      key={index}
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
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="specialRequests">Special requests (optional)</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => handleChange('specialRequests', e.target.value)}
                  placeholder="Any special requirements or requests…"
                  rows={3}
                  className="mt-1.5"
                />
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-toodles-text">Review and confirm</h3>
                <p className="text-sm text-muted-foreground">Payments are processed securely via Razorpay.</p>
              </div>

              <Card variant="ghost" className="bg-muted/40">
                <CardContent className="p-5">
                  <h4 className="font-display text-toodles-text mb-3">Booking summary</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Package</dt><dd className="font-medium">{selectedPackage?.name}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Date</dt><dd className="font-medium">{formData.bookingDate}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Time</dt><dd className="font-medium">{selectedTimeSlot?.startTime} – {selectedTimeSlot?.endTime}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Children</dt><dd className="font-medium">{formData.numberOfChildren}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-medium">₹{selectedPackage ? (parseFloat(selectedPackage.price) * formData.numberOfChildren) : 0}</dd></div>
                    {voucher && (
                      <div className="flex justify-between text-emerald-600"><dt>Discount</dt><dd className="font-medium">−₹{(selectedPackage ? (parseFloat(selectedPackage.price) * formData.numberOfChildren) : 0) - calculateTotal()}</dd></div>
                    )}
                    <div className="flex justify-between text-lg font-display text-toodles-primary border-t border-border pt-3 mt-3">
                      <dt>Total</dt><dd>₹{calculateTotal()}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={formData.voucherCode}
                  onChange={(e) => handleChange('voucherCode', e.target.value)}
                  placeholder="Have a voucher code?"
                />
                <Button onClick={checkVoucher} variant="outline">
                  <Gift className="h-4 w-4" />
                  Apply
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {/* Sticky footer */}
        <div className="border-t border-border bg-card/95 backdrop-blur px-6 sm:px-8 py-4 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          {step < 4 ? (
            <Button
              variant="festive"
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !formData.packageId) ||
                (step === 2 && (!formData.bookingDate || !formData.timeSlotId || (availability && !availability.available))) ||
                (step === 3 && (!formData.parentName || !formData.parentPhone || !formData.parentEmail))
              }
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="festive"
              size="lg"
              onClick={handlePayment}
              disabled={isProcessingPayment || !razorpayLoaded || createBookingMutation.isPending}
            >
              {isProcessingPayment || createBookingMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay ₹{calculateTotal()}
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
