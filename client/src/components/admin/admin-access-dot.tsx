import { useState } from "react";
import { Shield } from "lucide-react";

export function AdminAccessDot() {
  const [clicked, setClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`relative transition-all duration-300 ${
          clicked ? 'scale-110' : isHovered ? 'scale-150' : 'scale-100'
        }`}
      >
        {/* Main dot */}
        <div 
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            clicked 
              ? 'bg-toodles-primary shadow-lg' 
              : isHovered 
                ? 'bg-gray-600 shadow-md' 
                : 'bg-gray-400'
          }`}
          title="Admin Access"
        />
        
        {/* Pulse animation on hover */}
        {isHovered && (
          <div className="absolute inset-0 w-3 h-3 bg-gray-400 rounded-full animate-ping opacity-30" />
        )}
        
        {/* Tooltip */}
        <div 
          className={`absolute -top-10 -left-8 bg-black text-white text-xs px-3 py-1 rounded-md whitespace-nowrap transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <Shield className="w-3 h-3 inline mr-1" />
          Admin Access
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black" />
        </div>
      </div>
    </div>
  );
}