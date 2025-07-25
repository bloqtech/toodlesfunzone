import { useState } from "react";
import { Shield } from "lucide-react";

export function AdminAccessDot() {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 200);
  };

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 cursor-pointer group"
      onClick={handleClick}
    >
      <div 
        className={`w-3 h-3 bg-gray-400 rounded-full transition-all duration-300 hover:bg-gray-600 hover:scale-125 group-hover:shadow-lg ${
          clicked ? 'scale-110 bg-toodles-primary' : ''
        }`}
        title="Admin Access"
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-8 -left-6 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          <Shield className="w-3 h-3 inline mr-1" />
          Admin
        </div>
      </div>
    </div>
  );
}