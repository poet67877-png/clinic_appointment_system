import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Login() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleLogin = () => {
    window.location.href = "/api/oauth/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 rounded-lg border border-border bg-card">
        <h1 className="text-2xl font-bold text-center mb-2 text-primary">ClinicPlus</h1>
        <p className="text-center text-muted-foreground mb-6">تسجيل الدخول</p>
        {loading ? (
          <div className="w-full py-2 px-4 bg-primary/50 text-primary-foreground rounded-md font-medium text-center">
            جاري التحميل...
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            دخول
          </button>
        )}
      </div>
    </div>
  );
}
