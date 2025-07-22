import { AdminLogin } from "@/components/admin/admin-login";
import { useLocation } from "wouter";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();

  const handleLoginSuccess = (user: any) => {
    console.log("Admin login successful:", user);
    // Redirect to admin dashboard or reload the page
    window.location.reload();
  };

  return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
}