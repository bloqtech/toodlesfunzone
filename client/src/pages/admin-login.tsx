import { AdminLogin } from "@/components/admin/admin-login";
import { useLocation } from "wouter";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();

  const handleLoginSuccess = (user: any) => {
    console.log("Admin login successful:", user);
    // Redirect to admin dashboard
    setLocation("/admin/dashboard");
  };

  return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
}