import { useEffect, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Activities", href: "/activities" },
    { name: "Packages", href: "/packages" },
    { name: "Birthday Parties", href: "/birthday" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => location === path;

  const handleLogout = async () => {
    if ((user as any)?.isAdmin) {
      try {
        const response = await fetch("/api/admin/logout", {
          method: "POST",
          credentials: "include",
        });
        if (response.ok) window.location.href = "/";
        else console.error("Admin logout failed");
      } catch (error) {
        console.error("Error during admin logout:", error);
      }
    } else {
      window.location.href = "/";
    }
  };

  const handleMakeAdmin = async () => {
    try {
      const response = await fetch("/api/make-me-admin", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        alert("Admin access granted! Refreshing page...");
        window.location.reload();
      } else {
        alert("Failed to grant admin access. Please ensure you are logged in.");
      }
    } catch {
      alert("Error granting admin access");
    }
  };

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass-strong shadow-soft border-b border-border/60"
          : "bg-white/0 border-b border-transparent",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link href="/">
              <img
                src={toodlesLogo}
                alt="Toodles Funzone Logo"
                className="h-16 md:h-20 w-auto cursor-pointer toodles-logo-hover"
              />
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.name} href={item.href}>
                  <span
                    className={[
                      "relative cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "text-toodles-primary bg-toodles-primary/10"
                        : "text-toodles-text/80 hover:text-toodles-primary hover:bg-toodles-primary/5",
                    ].join(" ")}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-2 rounded-full bg-toodles-primary/10 px-3 py-1.5">
                  <User className="h-4 w-4 text-toodles-primary" />
                  <span className="text-sm font-medium text-toodles-text">
                    {(user as any)?.firstName || "User"}
                  </span>
                </div>
                {(user as any)?.isAdmin && (
                  <Link href="/admin/dashboard">
                    <Button variant="default" size="sm" className="hidden md:inline-flex">
                      <Shield className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                {!(user as any)?.isAdmin && (
                  <Button
                    variant="accent"
                    size="sm"
                    className="hidden md:inline-flex"
                    onClick={handleMakeAdmin}
                  >
                    <Shield className="h-4 w-4" />
                    Get admin
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="festive"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => (window.location.href = "/login")}
              >
                Login with WhatsApp
              </Button>
            )}

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="bg-toodles-hero text-white px-6 py-6">
                  <img
                    src={toodlesLogo}
                    alt="Toodles Funzone"
                    className="h-14 w-auto mb-2"
                  />
                  <p className="text-white/85 text-sm">Big fun for little feet.</p>
                </div>
                <nav className="flex flex-col gap-1 px-4 pt-4">
                  {navigation.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link key={item.name} href={item.href}>
                        <span
                          className={[
                            "block cursor-pointer rounded-xl px-3 py-2.5 text-base font-medium transition-colors",
                            active
                              ? "bg-toodles-primary/10 text-toodles-primary"
                              : "text-toodles-text hover:bg-muted",
                          ].join(" ")}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}

                  <div className="mt-4 border-t pt-4 space-y-2">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center gap-2 rounded-xl bg-toodles-primary/10 px-3 py-2">
                          <User className="h-4 w-4 text-toodles-primary" />
                          <span className="text-sm font-medium text-toodles-text">
                            {(user as any)?.firstName || "User"}
                          </span>
                        </div>
                        {(user as any)?.isAdmin && (
                          <Link href="/admin/dashboard">
                            <Button variant="default" className="w-full">
                              <Shield className="h-4 w-4" />
                              Admin Panel
                            </Button>
                          </Link>
                        )}
                        {!(user as any)?.isAdmin && (
                          <Button
                            variant="accent"
                            className="w-full"
                            onClick={handleMakeAdmin}
                          >
                            <Shield className="h-4 w-4" />
                            Get admin access
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="festive"
                        className="w-full"
                        onClick={() => (window.location.href = "/login")}
                      >
                        Login with WhatsApp
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
