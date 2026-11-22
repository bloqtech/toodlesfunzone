import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BookingModal } from "@/components/booking/booking-modal";
import { BirthdayForm } from "@/components/booking/birthday-form";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { HomeExperience } from "@/components/common/home-experience";

export default function Landing() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBirthdayForm, setShowBirthdayForm] = useState(false);
  const { data: packages = [] } = useQuery<any[]>({ queryKey: ["/api/packages"] });

  return (
    <div className="min-h-screen bg-toodles-background">
      <Header />
      <HomeExperience onBook={() => setShowBookingModal(true)} onBirthday={() => setShowBirthdayForm(true)} />
      <Footer />
      <FloatingWhatsApp />
      {showBookingModal && (
        <BookingModal onClose={() => setShowBookingModal(false)} packages={packages} />
      )}
      {showBirthdayForm && <BirthdayForm onClose={() => setShowBirthdayForm(false)} />}
    </div>
  );
}
