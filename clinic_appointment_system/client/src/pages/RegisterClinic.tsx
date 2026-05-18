import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function RegisterClinic() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    email: "",
    phone: "",
  });
  const [checking, setChecking] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState<"available" | "taken" | null>(null);

  const registerMutation = trpc.clinicRegistration.registerClinic.useMutation({
    onSuccess: (data) => {
      toast.success("تم تسجيل العيادة بنجاح!");
      setTimeout(() => {
        window.location.href = `https://${data.subdomain}.manus.space`;
      }, 1500);
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ في التسجيل");
    },
  });

  const checkSubdomain = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) return;
    setChecking(true);
    try {
      const result = await (trpc.clinicRegistration.checkSubdomainAvailability as any).query({
        subdomain,
      });
      setSubdomainStatus(result.available ? "available" : "taken");
    } catch (error) {
      setSubdomainStatus(null);
    } finally {
      setChecking(false);
    }
  };

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData((prev) => ({
      ...prev,
      subdomain: value,
    }));
    if (value.length >= 3) {
      checkSubdomain(value);
    } else {
      setSubdomainStatus(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم العيادة");
      return;
    }

    if (!formData.subdomain.trim() || formData.subdomain.length < 3) {
      toast.error("يرجى إدخال نطاق فرعي صحيح (3 أحرف على الأقل)");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      toast.error("النطاق الفرعي يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط");
      return;
    }

    if (subdomainStatus !== "available") {
      toast.error("هذا النطاق الفرعي غير متاح");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("يرجى إدخال بريد إلكتروني");
      return;
    }

    registerMutation.mutate({
      name: formData.name,
      subdomain: formData.subdomain,
      email: formData.email,
      phone: formData.phone,
    });
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-8">
        <Card className="clinic-card max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              يجب تسجيل الدخول أولاً لتسجيل عيادة جديدة
            </p>
            <Button onClick={() => navigate("/")} className="w-full clinic-button-primary">
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-accent" />
          </div>
          <h1 className="text-4xl font-bold text-accent mb-2">تسجيل عيادة جديدة</h1>
          <p className="text-muted-foreground">أنشئ حسابك الخاص وابدأ باستخدام النظام</p>
        </div>

        {/* Registration Form */}
        <Card className="clinic-card">
          <CardHeader>
            <CardTitle>معلومات العيادة</CardTitle>
            <CardDescription>أدخل المعلومات الأساسية لعيادتك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Clinic Name */}
              <div>
                <Label className="clinic-label">اسم العيادة</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="مثال: عيادة النور"
                  className="clinic-input"
                />
              </div>

              {/* Subdomain */}
              <div>
                <Label className="clinic-label">النطاق الفرعي</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleSubdomainChange}
                    placeholder="clinic-name"
                    className="clinic-input"
                  />
                  <div className="flex items-center px-3 bg-muted rounded-lg border border-border text-sm text-muted-foreground">
                    .manus.space
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {checking && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
                  {subdomainStatus === "available" && (
                    <p className="text-xs text-green-400">✓ هذا النطاق الفرعي متاح</p>
                  )}
                  {subdomainStatus === "taken" && (
                    <p className="text-xs text-red-400">✗ هذا النطاق الفرعي مستخدم بالفعل</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  سيكون رابط عيادتك: {formData.subdomain || "clinic-name"}.manus.space
                </p>
              </div>

              {/* Email */}
              <div>
                <Label className="clinic-label">البريد الإلكتروني</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="clinic@example.com"
                  className="clinic-input"
                />
              </div>

              {/* Phone (Optional) */}
              <div>
                <Label className="clinic-label">رقم الهاتف (اختياري)</Label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+966 50 123 4567"
                  className="clinic-input"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={registerMutation.isPending || subdomainStatus !== "available"}
                  className="flex-1 clinic-button-primary"
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      جاري التسجيل...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      تسجيل العيادة
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="clinic-button-secondary"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
