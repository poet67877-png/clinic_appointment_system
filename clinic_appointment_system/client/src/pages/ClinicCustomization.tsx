import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, Save, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ClinicCustomization() {
  const [preview, setPreview] = useState<{
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    coverImage?: string;
  }>({
    primaryColor: "#3b82f6",
    secondaryColor: "#06b6d4",
  });

  // Fetch current settings
  const { data: settings, isLoading } = trpc.clinicCustomization.getSettings.useQuery();

  // Mutations
  const updateBasicInfoMutation = trpc.clinicCustomization.updateBasicInfo.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث البيانات الأساسية");
    },
  });

  const updateColorsMutation = trpc.clinicCustomization.updateColors.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الألوان");
    },
  });

  const uploadLogoMutation = trpc.clinicCustomization.uploadLogo.useMutation({
    onSuccess: (data) => {
      toast.success("تم رفع الشعار بنجاح");
      setPreview((prev) => ({ ...prev, logo: data.url }));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadCoverMutation = trpc.clinicCustomization.uploadCoverImage.useMutation({
    onSuccess: (data) => {
      toast.success("تم رفع صورة الغلاف بنجاح");
      setPreview((prev) => ({ ...prev, coverImage: data.url }));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFileUpload = async (
    file: File,
    type: "logo" | "cover"
  ) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      if (type === "logo") {
        uploadLogoMutation.mutate({ base64, fileName: file.name });
      } else {
        uploadCoverMutation.mutate({ base64, fileName: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return <div className="p-8">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">تخصيص العيادة</h1>
          <p className="text-muted-foreground">
            خصص واجهة عيادتك بشعارك وألوانك وبيانات خاصة بك
          </p>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
            <TabsTrigger value="branding">الهوية البصرية</TabsTrigger>
            <TabsTrigger value="preview">المعاينة</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>البيانات الأساسية</CardTitle>
                <CardDescription>
                  اسم العيادة ورقم الواتساب والوصف
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="clinic-name">اسم العيادة</Label>
                  <Input
                    id="clinic-name"
                    defaultValue={settings?.name || ""}
                    placeholder="مثال: عيادة النور"
                    onChange={(e) => {
                      setPreview((prev) => ({
                        ...prev,
                      }));
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">رقم واتساب</Label>
                  <Input
                    id="whatsapp"
                    defaultValue={settings?.whatsappNumber || ""}
                    placeholder="مثال: 07707901154"
                    onChange={(e) => {
                      setPreview((prev) => ({
                        ...prev,
                      }));
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    رقم واتساب خاص بعيادتك للتواصل المباشر مع المرضى
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">وصف العيادة</Label>
                  <Textarea
                    id="description"
                    defaultValue={settings?.description || ""}
                    placeholder="اكتب وصفاً عن عيادتك..."
                    rows={4}
                  />
                </div>

                <Button className="w-full">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ البيانات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الهوية البصرية</CardTitle>
                <CardDescription>
                  شعار العيادة والألوان وصورة الغلاف
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <Label>شعار العيادة</Label>
                  <div className="border-2 border-dashed border-accent rounded-lg p-8 text-center">
                    {preview.logo ? (
                      <div className="space-y-4">
                        <img
                          src={preview.logo}
                          alt="Logo"
                          className="h-24 mx-auto"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileUpload(file, "logo");
                            };
                            input.click();
                          }}
                        >
                          <Upload className="w-4 h-4 ml-2" />
                          تغيير الشعار
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload(file, "logo");
                          };
                          input.click();
                        }}
                      >
                        <Upload className="w-4 h-4 ml-2" />
                        رفع الشعار
                      </Button>
                    )}
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-4">
                  <Label>صورة الغلاف</Label>
                  <div className="border-2 border-dashed border-accent rounded-lg p-8 text-center">
                    {preview.coverImage ? (
                      <div className="space-y-4">
                        <img
                          src={preview.coverImage}
                          alt="Cover"
                          className="w-full h-40 object-cover rounded"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileUpload(file, "cover");
                            };
                            input.click();
                          }}
                        >
                          <Upload className="w-4 h-4 ml-2" />
                          تغيير الصورة
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload(file, "cover");
                          };
                          input.click();
                        }}
                      >
                        <Upload className="w-4 h-4 ml-2" />
                        رفع صورة الغلاف
                      </Button>
                    )}
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="primary-color">اللون الأساسي</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        id="primary-color"
                        type="color"
                        defaultValue={settings?.primaryColor || "#3b82f6" || "#3b82f6"}
                        onChange={(e) => {
                          setPreview((prev) => ({
                            ...prev,
                            primaryColor: e.target.value,
                          }));
                        }}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <Input
                        value={preview.primaryColor}
                        readOnly
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondary-color">اللون الثانوي</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        id="secondary-color"
                        type="color"
                        defaultValue={settings?.secondaryColor || "#06b6d4" || "#06b6d4"}
                        onChange={(e) => {
                          setPreview((prev) => ({
                            ...prev,
                            secondaryColor: e.target.value,
                          }));
                        }}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <Input
                        value={preview.secondaryColor}
                        readOnly
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ الهوية البصرية
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معاينة الصفحة الرئيسية</CardTitle>
                <CardDescription>
                  هكذا ستظهر عيادتك للمرضى
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="rounded-lg overflow-hidden border"
                  style={{
                    backgroundColor: preview.primaryColor + "15",
                  }}
                >
                  {/* Header */}
                  <div
                    className="p-6 text-white"
                    style={{ backgroundColor: preview.primaryColor }}
                  >
                    <div className="flex items-center gap-4">
                      {preview.logo && (
                        <img
                          src={preview.logo}
                          alt="Logo"
                          className="h-16 w-16 rounded"
                        />
                      )}
                      <div>
                        <h1 className="text-3xl font-bold">
                          {settings?.name || "اسم العيادة"}
                        </h1>
                        <p className="text-sm opacity-90">
                          {settings?.description || "وصف العيادة"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cover */}
                  {preview.coverImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={preview.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="p-4 rounded-lg text-center"
                          style={{
                            backgroundColor: preview.secondaryColor + "20",
                            borderLeft: `4px solid ${preview.secondaryColor}`,
                          }}
                        >
                          <div className="font-semibold">الطبيب {i}</div>
                          <div className="text-sm text-muted-foreground">
                            التخصص
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-center">
                      <Button
                        style={{ backgroundColor: preview.primaryColor }}
                        className="text-white"
                      >
                        احجز موعدك الآن
                      </Button>
                    </div>

                    {/* WhatsApp Button */}
                    {settings?.whatsappNumber && (
                      <div className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg">
                        📱 {settings.whatsappNumber}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
