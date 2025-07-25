import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Menu, User, LogOut, Shield } from "lucide-react";
import toodlesLogo from "@assets/Logo Toodles - Edited (1)_1753203790787.png";

export function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Activities", href: "/activities" },
    { name: "Packages", href: "/packages" },
    { name: "Birthday Parties", href: "/birthday" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/">
              <img 
                src={toodlesLogo} 
                alt="Toodles Funzone Logo" 
                className="h-24 w-auto cursor-pointer toodles-logo-hover transition-all duration-300"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <span className={`text-toodles-text hover:text-toodles-primary transition-colors font-medium font-accent cursor-pointer ${
                  isActive(item.href) ? 'text-toodles-primary border-b-2 border-toodles-primary' : ''
                }`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <User className="h-4 w-4 text-toodles-primary" />
                  <span className="text-sm font-medium text-toodles-text">
                    {user?.firstName || 'User'}
                  </span>
                </div>
                {user?.isAdmin && (
                  <Link href="/admin/dashboard">
                    <Button variant="default" className="hidden md:inline-flex bg-toodles-primary hover:bg-toodles-primary/90 text-white">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                {/* Admin Access Button for non-admin users */}
                {!user?.isAdmin && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="hidden md:inline-flex bg-toodles-accent hover:bg-toodles-accent/90 text-toodles-text font-medium"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/make-me-admin', {
                          method: 'POST',
                          credentials: 'include'
                        });
                        if (response.ok) {
                          alert('Admin access granted! Refreshing page...');
                          window.location.reload();
                        } else {
                          alert('Failed to grant admin access. Please ensure you are logged in.');
                        }
                      } catch (error) {
                        alert('Error granting admin access');
                      }
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Get Admin Access
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="hidden md:inline-flex"
                  onClick={async () => {
                    if (user?.isAdmin) {
                      // Admin logout
                      try {
                        const response = await fetch('/api/admin/logout', {
                          method: 'POST',
                          credentials: 'include'
                        });
                        if (response.ok) {
                          window.location.href = '/';
                        } else {
                          console.error('Admin logout failed');
                        }
                      } catch (error) {
                        console.error('Error during admin logout:', error);
                      }
                    } else {
                      // Regular user logout
                      window.location.href = '/api/logout';
                    }
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                className="bg-toodles-primary hover:bg-red-600 text-white font-accent font-medium"
                onClick={() => window.location.href = '/api/login'}
              >
                Login
              </Button>
            )}
            
            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <span 
                        className={`text-toodles-text hover:text-toodles-primary transition-colors font-medium font-accent cursor-pointer block py-2 ${
                          isActive(item.href) ? 'text-toodles-primary' : ''
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </span>
                    </Link>
                  ))}
                  
                  <div className="pt-4 border-t">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center space-x-2 mb-4">
                          <User className="h-4 w-4 text-toodles-primary" />
                          <span className="text-sm font-medium text-toodles-text">
                            {user?.firstName || 'User'}
                          </span>
                        </div>
                        {user?.isAdmin && (
                          <Link href="/admin/dashboard">
                            <Button variant="default" className="w-full mb-2 bg-toodles-primary hover:bg-toodles-primary/90">
                              <Shield className="h-4 w-4 mr-2" />
                              Admin Panel
                            </Button>
                          </Link>
                        )}
                        {/* Mobile Admin Access Button */}
                        {!user?.isAdmin && (
                          <Button 
                            variant="secondary"
                            className="w-full mb-2 bg-toodles-accent hover:bg-toodles-accent/90 text-toodles-text"
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/make-me-admin', {
                                  method: 'POST',
                                  credentials: 'include'
                                });
                                if (response.ok) {
                                  alert('Admin access granted! Refreshing page...');
                                  window.location.reload();
                                } else {
                                  alert('Failed to grant admin access. Please ensure you are logged in.');
                                }
                              } catch (error) {
                                alert('Error granting admin access');
                              }
                            }}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Get Admin Access
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={async () => {
                            if (user?.isAdmin) {
                              // Admin logout
                              try {
                                const response = await fetch('/api/admin/logout', {
                                  method: 'POST',
                                  credentials: 'include'
                                });
                                if (response.ok) {
                                  window.location.href = '/';
                                } else {
                                  console.error('Admin logout failed');
                                }
                              } catch (error) {
                                console.error('Error during admin logout:', error);
                              }
                            } else {
                              // Regular user logout
                              window.location.href = '/api/logout';
                            }
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Button 
                        className="w-full bg-toodles-primary hover:bg-red-600 text-white font-accent font-medium"
                        onClick={() => window.location.href = '/api/login'}
                      >
                        Login
                      </Button>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
