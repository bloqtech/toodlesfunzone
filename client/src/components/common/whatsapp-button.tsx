import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

export function WhatsAppButton({ 
  phoneNumber = "+919901218980", 
  message = "Hi! I'd like to know more about Toodles Funzone.",
  className = "",
  children
}: WhatsAppButtonProps) {
  
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    
    // Track WhatsApp button click
    trackEvent('whatsapp_click', 'contact', 'whatsapp_button');
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className={`bg-green-500 hover:bg-green-600 text-white ${className}`}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {children || "WhatsApp Us"}
    </Button>
  );
}

// Floating WhatsApp button component
export function FloatingWhatsAppButton() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <WhatsAppButton 
        className="rounded-full p-3 shadow-lg animate-pulse hover:animate-none"
        message="Hi! I'm interested in booking a play session at Toodles Funzone. Can you help me?"
      >
        <MessageCircle className="h-6 w-6" />
      </WhatsAppButton>
    </div>
  );
}