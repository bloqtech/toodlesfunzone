import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = "+919901218980"; // Toodles Funzone WhatsApp number
  const defaultMessage = "Hi! I'm interested in booking a play session at Toodles Funzone. Can you please help me?";

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank');
  };

  const quickMessages = [
    {
      text: "Book a play session",
      message: "Hi! I'd like to book a play session. Can you please help me with the available slots?"
    },
    {
      text: "Birthday party enquiry",
      message: "Hi! I'm interested in booking a birthday party. Can you please share the package details?"
    },
    {
      text: "Check availability",
      message: "Hi! Can you please check the availability for this weekend?"
    },
    {
      text: "General enquiry",
      message: "Hi! I have some questions about Toodles Funzone. Can you please help me?"
    }
  ];

  const handleQuickMessage = (message: string) => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Quick Messages Popup */}
      {isOpen && (
        <div className="mb-4 bg-white rounded-lg shadow-xl p-4 w-80 max-w-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-toodles-text">Quick Messages</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {quickMessages.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickMessage(item.message)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-toodles-primary hover:text-white rounded-lg transition-colors text-sm"
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main WhatsApp Button */}
      <div className="relative">
        <Button
          onClick={handleWhatsAppClick}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110 animate-bounce-gentle"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        
        {/* Quick Actions Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -top-2 -right-2 bg-toodles-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>

      {/* Pulsing Animation */}
      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75 pointer-events-none"></div>
    </div>
  );
}
