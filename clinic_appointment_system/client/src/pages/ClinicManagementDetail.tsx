import { useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface Clinic {
  id: number;
  name: string;
  slug: string;
  email: string;
  subscriptionPlan: "free" | "basic" | "professional";
  subscriptionStatus: "active" | "trial" | "suspended" | "cancelled";
  trialEndDate: string | null;
  subscriptionEndDate: string | null;
  createdAt: string;
  notes: string;
}

export default function ClinicManagementDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/super-admin/clinic/:id");
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    plan: "basic" as "free" | "basic" | "professional",
    status: "active" as "active" | "trial" | "suspended" | "cancelled",
    endDate: "",
    notes: "",
  });

  // التحقق من تسجيل الدخول
  useEffect(() => {
    const token = localStorage.getItem("superAdminToken");
    if (!token) {
      setLocation("/super-admin/login");
      return;
    }

    // محاكاة جلب بيانات العيادة
    setTimeout(() => {
      const mockClinic: Clinic = {
        id: parseInt(params?.id || "1"),
        name: "عيادة النور",
        slug: "عيادة-النور",
        email: "clinic@example.com",
        subscriptionPlan: "professional",
        subscriptionStatus: "active",
        trialEndDate: null,
        subscriptionEndDate: "2025-12-31",
        createdAt: "2024-01-15",
        notes: "عيادة موثوقة وموثقة",
      };
      setClinic(mockClinic);
      setFormData({
        plan: mockClinic.subscriptionPlan,
        status: mockClinic.subscriptionStatus,
        endDate: mockClinic.subscriptionEndDate || "",
        notes: mockClinic.notes,
      });
      setLoading(false);
    }, 500);
  }, [params?.id, setLocation]);

  const handleActivateSubscription = () => {
    if (!clinic) return;
    setFormData({ ...formData, status: "active" });
    toast.success("تم تفعيل الاشتراك");
  };

  const handleSuspendSubscription = () => {
    if (!clinic) return;
    setFormData({ ...formData, status: "suspended" });
    toast.warning("تم إيقاف الاشتراك");
  };

  const handleChangePlan = (newPlan: "free" | "basic" | "professional") => {
    setFormData({ ...formData, plan: newPlan });
    toast.info(`تم تغيير الخطة إلى ${newPlan}`);
  };

  const handleSaveChanges = () => {
    if (!clinic) return;
    toast.success("تم حفظ التغييرات بنجاح");
    setIsEditMode(false);
  };

  const handleDeleteClinic = () => {
    if (!clinic) return;
    toast.success("تم حذف العيادة");
    setLocation("/super-admin/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>لم يتم العثور على العيادة</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getPlanLabel = (plan: string) => {
    const plans: Record<string, string> = {
      free: "مجاني",
      basic: "أساسي",
      professional: "احترافي",
    };
    return plans[plan] || plan;
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      active: "نشط",
      trial: "تجريبي",
      suspended: "موقوف",
      cancelled: "ملغى",
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-700";
      case "trial":
        return "bg-blue-500/20 text-blue-700";
      case "suspended":
        return "bg-red-500/20 text-red-700";
      case "cancelled":
        return "bg-gray-500/20 text-gray-700";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/super-admin/dashboard")}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{clinic.name}</h1>
              <p className="text-muted-foreground">{clinic.email}</p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">الخطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getPlanLabel(formData.plan)}</div>
              <p className="text-xs text-muted-foreground mt-1">الخطة الحالية</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">حالة الاشتراك</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.status)}`}>
                {getStatusLabel(formData.status)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">الحالة الحالية</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">تاريخ الانتهاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formData.endDate || "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">آخر يوم للاشتراك</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إدارة الاشتراك</CardTitle>
            <CardDescription>تغيير حالة واشتراك العيادة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Activate Button */}
              <Button
                onClick={handleActivateSubscription}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 ml-2" />
                تفعيل الاشتراك
              </Button>

              {/* Suspend Button */}
              <Button
                onClick={handleSuspendSubscription}
                variant="destructive"
                className="w-full"
              >
                <XCircle className="w-4 h-4 ml-2" />
                إيقاف الاشتراك
              </Button>
            </div>

            {/* Change Plan */}
            <div className="space-y-2">
              <Label>تغيير الخطة</Label>
              <div className="grid grid-cols-3 gap-2">
                {["free", "basic", "professional"].map((plan) => (
                  <Button
                    key={plan}
                    variant={formData.plan === plan ? "default" : "outline"}
                    onClick={() => handleChangePlan(plan as any)}
                    className="w-full"
                  >
                    {getPlanLabel(plan)}
                  </Button>
                ))}
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">تاريخ انتهاء الاشتراك</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="border-accent/20"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أضف ملاحظات عن العيادة..."
                className="border-accent/20 resize-none"
                rows={4}
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveChanges}
              className="w-full bg-accent hover:bg-accent/90"
            >
              <Save className="w-4 h-4 ml-2" />
              حفظ التغييرات
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-600">منطقة الخطر</CardTitle>
            <CardDescription>إجراءات لا يمكن التراجع عنها</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف العيادة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>تأكيد الحذف</DialogTitle>
                  <DialogDescription>
                    هل أنت متأكد من رغبتك في حذف العيادة "{clinic.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    إلغاء
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDeleteClinic}
                  >
                    تأكيد الحذف
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">معلومات العيادة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">معرف العيادة:</span>
              <span className="font-mono">{clinic.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الرابط:</span>
              <span className="font-mono">{clinic.slug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">تاريخ التسجيل:</span>
              <span className="font-mono">{clinic.createdAt}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
