import { Link } from "wouter";
import { Facebook, Instagram, MessageCircle, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-toodles-text text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img 
              src="https://toodlesfunzone.com/assets/Toodles%20logo_1750663392538-BrPmoFIh.jpg" 
              alt="Toodles Funzone" 
              className="h-12 w-auto mb-4"
            />
            <p className="text-gray-300 mb-4">
              India's premier indoor playground experience where big fun meets little feet.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-toodles-primary hover:text-toodles-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-toodles-primary hover:text-toodles-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-toodles-primary hover:text-toodles-accent transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-toodles-primary hover:text-toodles-accent transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-display text-toodles-accent mb-4">About Toodles</h3>
            <ul className="space-y-2">
              <li><Link href="/activities"><span className="text-gray-300 hover:text-toodles-accent transition-colors cursor-pointer">Activities</span></Link></li>
              <li><Link href="/"><span className="text-gray-300 hover:text-toodles-accent transition-colors cursor-pointer">Our Story</span></Link></li>
              <li><Link href="/packages"><span className="text-gray-300 hover:text-toodles-accent transition-colors cursor-pointer">Packages</span></Link></li>
              <li><Link href="/birthday"><span className="text-gray-300 hover:text-toodles-accent transition-colors cursor-pointer">Birthday Parties</span></Link></li>
              <li><Link href="/gallery"><span className="text-gray-300 hover:text-toodles-accent transition-colors cursor-pointer">Gallery</span></Link></li>
              <li><span className="text-gray-300 hover:text-toodles-accent transition-colors cursor-pointer">Safety Guidelines</span></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-display text-toodles-accent mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/contact"><span className="text-gray-300 hover:text-toodles-accent transition-colors cursor-pointer">Contact Us</span></Link></li>
              <li><span className="text-gray-300 hover:text-toodles-accent transition-colors cursor-pointer">FAQ</span></li>
              <li><span className="text-gray-300 hover:text-toodles-accent transition-colors cursor-pointer">Booking Help</span></li>
              <li><span className="text-gray-300 hover:text-toodles-accent transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="text-gray-300 hover:text-toodles-accent transition-colors cursor-pointer">Terms & Conditions</span></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-display text-toodles-accent mb-4">Get In Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="text-toodles-primary mr-3">📍</div>
                <span className="text-gray-300">Opposite Vishnu Leela Veg, Kodathi, Off Sarjapur Road, Bangalore</span>
              </div>
              <div className="flex items-center">
                <div className="text-toodles-primary mr-3">📞</div>
                <span className="text-gray-300">+91 99012 18980</span>
              </div>
              <div className="flex items-center">
                <div className="text-toodles-primary mr-3">✉️</div>
                <span className="text-gray-300">hello@toodlesfunzone.com</span>
              </div>
              <div className="flex items-center">
                <div className="text-toodles-primary mr-3">🕒</div>
                <span className="text-gray-300">10 AM - 8 PM Daily</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            Copyright © 2025 Toodles Funzone. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
