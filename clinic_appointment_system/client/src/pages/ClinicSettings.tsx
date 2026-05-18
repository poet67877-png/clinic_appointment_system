import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Check } from "lucide-react";
import { toast } from "sonner";

export default function ClinicSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    clinicName: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#06b6d4",
    logo: null as File | null,
    logoPreview: "",
  });

  const handleColorChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5 MB");
        return;
      }

      setSettings((prev) => ({
        ...prev,
        logo: file,
        logoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate saving
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("تم حفظ الإعدادات بنجاح!");
    } catch (error) {
      toast.error("حدث خطأ في حفظ الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">إعدادات العيادة</h1>
          <p className="text-muted-foreground">
            خصص مظهر عيادتك بالشعار والألوان
          </p>
        </div>

        {/* Settings Form */}
        <Card className="clinic-card">
          <CardHeader>
            <CardTitle>تخصيص العيادة</CardTitle>
            <CardDescription>
              اختر الألوان والشعار الخاص بعيادتك
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Clinic Name */}
            <div>
              <Label className="clinic-label">اسم العيادة</Label>
              <Input
                type="text"
                value={settings.clinicName}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    clinicName: e.target.value,
                  }))
                }
                placeholder="اسم عيادتك"
                className="clinic-input"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <Label className="clinic-label">شعار العيادة</Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-card transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 text-accent mb-2" />
                      <span className="text-sm text-muted-foreground">
                        اضغط لتحميل الشعار
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        PNG, JPG (5MB max)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {settings.logoPreview && (
                  <div className="flex items-center justify-center">
                    <img
                      src={settings.logoPreview}
                      alt="Logo Preview"
                      className="h-24 w-24 object-contain rounded-lg border border-border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <Label className="clinic-label">اللون الأساسي</Label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) =>
                    handleColorChange("primaryColor", e.target.value)
                  }
                  className="w-16 h-16 rounded-lg cursor-pointer border border-border"
                />
                <div>
                  <p className="text-sm font-semibold">{settings.primaryColor}</p>
                  <p className="text-xs text-muted-foreground">
                    يُستخدم للأزرار والعناوين
                  </p>
                </div>
              </div>
            </div>

            {/* Secondary Color */}
            <div>
              <Label className="clinic-label">اللون الثانوي</Label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) =>
                    handleColorChange("secondaryColor", e.target.value)
                  }
                  className="w-16 h-16 rounded-lg cursor-pointer border border-border"
                />
                <div>
                  <p className="text-sm font-semibold">{settings.secondaryColor}</p>
                  <p className="text-xs text-muted-foreground">
                    يُستخدم للتأكيدات والعناصر الثانوية
                  </p>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="font-semibold mb-4">معاينة</h3>
              <div className="space-y-4">
                <div
                  className="h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  زر أساسي
                </div>
                <div
                  className="h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: settings.secondaryColor }}
                >
                  زر ثانوي
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 clinic-button-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    حفظ الإعدادات
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
