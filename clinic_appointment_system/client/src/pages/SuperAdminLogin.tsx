import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من الحقول
    if (!email || !password) {
      setError("يرجى ملء جميع الحقول");
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // تحقق من بيانات الدخول
      if (email.trim() === "majid@clinicplus.iq" && password === "MajidAdmin2024") {
        // احفظ التوكن في localStorage
        const token = btoa(`${email}:${password}`);
        localStorage.setItem("superAdminToken", token);
        localStorage.setItem("superAdminEmail", email);
        
        toast.success("تم تسجيل الدخول بنجاح ✓");
        
        // انتظر قليلاً قبل الانتقال
        setTimeout(() => {
          setLocation("/super-admin/dashboard");
        }, 500);
      } else {
        setError("بيانات الدخول غير صحيحة. تحقق من الإيميل وكلمة المرور.");
        toast.error("بيانات الدخول غير صحيحة");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("حدث خطأ أثناء تسجيل الدخول");
      toast.error("حدث خطأ أثناء تسجيل الدخول");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-accent">ClinicPlus</h1>
          <p className="text-muted-foreground">لوحة تحكم المسؤول الأعلى</p>
        </div>

        {/* Login Card */}
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle>تسجيل الدخول</CardTitle>
            <CardDescription>
              أدخل بيانات دخول المسؤول الأعلى
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="majid@clinicplus.iq"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="border-accent/20 focus:border-accent"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="border-accent/20 focus:border-accent"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-2 rounded-lg transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري التسجيل...
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground space-y-2 border border-accent/20">
              <p className="font-semibold text-accent">بيانات الاختبار:</p>
              <div className="space-y-1 font-mono text-xs">
                <p>البريد: <span className="text-accent">majid@clinicplus.iq</span></p>
                <p>كلمة المرور: <span className="text-accent">MajidAdmin2024</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          © 2024 ClinicPlus. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
}
