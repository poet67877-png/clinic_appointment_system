import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LogOut,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle,
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

const mockClinics: Clinic[] = [
  {
    id: 1,
    name: "عيادة النور",
    slug: "عيادة-النور",
    email: "clinic@example.com",
    subscriptionPlan: "professional",
    subscriptionStatus: "active",
    trialEndDate: null,
    subscriptionEndDate: "2025-12-31",
    createdAt: "2024-01-15",
    notes: "عيادة موثوقة",
  },
  {
    id: 2,
    name: "عيادة الشفاء",
    slug: "عيادة-الشفاء",
    email: "clinic2@example.com",
    subscriptionPlan: "basic",
    subscriptionStatus: "trial",
    trialEndDate: "2024-06-15",
    subscriptionEndDate: null,
    createdAt: "2024-05-15",
    notes: "",
  },
];

export default function SuperAdminDashboard2() {
  const [, setLocation] = useLocation();
  const [clinics, setClinics] = useState<Clinic[]>(mockClinics);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState<"free" | "basic" | "professional">("basic");
  const [newStatus, setNewStatus] = useState<"active" | "trial" | "suspended" | "cancelled">("active");
  const [notes, setNotes] = useState("");

  // التحقق من تسجيل الدخول
  useEffect(() => {
    const token = localStorage.getItem("superAdminToken");
    if (!token) {
      setLocation("/super-admin/login");
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("superAdminToken");
    localStorage.removeItem("superAdminEmail");
    toast.success("تم تسجيل الخروج");
    setLocation("/super-admin/login");
  };

  const handleEditClinic = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setNewPlan(clinic.subscriptionPlan);
    setNewStatus(clinic.subscriptionStatus);
    setNotes(clinic.notes);
    setIsEditDialogOpen(true);
  };

  const handleSaveClinic = () => {
    if (!editingClinic) return;

    const updatedClinics = clinics.map((clinic) =>
      clinic.id === editingClinic.id
        ? {
            ...clinic,
            subscriptionPlan: newPlan,
            subscriptionStatus: newStatus,
            notes,
          }
        : clinic
    );

    setClinics(updatedClinics);
    setIsEditDialogOpen(false);
    toast.success("تم تحديث بيانات العيادة");
  };

  const handleDeleteClinic = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه العيادة؟")) {
      setClinics(clinics.filter((clinic) => clinic.id !== id));
      toast.success("تم حذف العيادة");
    }
  };

  // الإحصائيات
  const stats = {
    totalClinics: clinics.length,
    activeClinics: clinics.filter((c) => c.subscriptionStatus === "active").length,
    trialClinics: clinics.filter((c) => c.subscriptionStatus === "trial").length,
    revenue: clinics
      .filter((c) => c.subscriptionStatus === "active")
      .reduce((sum, c) => {
        if (c.subscriptionPlan === "basic") return sum + 25000;
        if (c.subscriptionPlan === "professional") return sum + 60000;
        return sum;
      }, 0),
  };

  const planLabels = {
    free: "مجاني",
    basic: "أساسي",
    professional: "احترافي",
  };

  const statusLabels = {
    active: "نشط",
    trial: "تجريبي",
    suspended: "موقوف",
    cancelled: "ملغى",
  };

  const statusColors = {
    active: "bg-green-500/20 text-green-700",
    trial: "bg-blue-500/20 text-blue-700",
    suspended: "bg-yellow-500/20 text-yellow-700",
    cancelled: "bg-red-500/20 text-red-700",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-accent">ClinicPlus Admin</h1>
            <p className="text-sm text-muted-foreground">لوحة تحكم المسؤول الأعلى</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي العيادات</p>
                  <p className="text-3xl font-bold text-accent">{stats.totalClinics}</p>
                </div>
                <Users className="w-8 h-8 text-accent/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">العيادات النشطة</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeClinics}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الفترات التجريبية</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.trialClinics}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الإيرادات الشهرية</p>
                  <p className="text-3xl font-bold text-accent">
                    {(stats.revenue / 1000).toFixed(0)}K د.ع
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-accent/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="clinics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clinics">العيادات</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>

          {/* Clinics Tab */}
          <TabsContent value="clinics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>قائمة العيادات</CardTitle>
                <CardDescription>إدارة جميع العيادات المسجلة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم العيادة</TableHead>
                        <TableHead>البريد الإلكتروني</TableHead>
                        <TableHead>الخطة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>تاريخ الإنشاء</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clinics.map((clinic) => (
                        <TableRow key={clinic.id}>
                          <TableCell className="font-semibold">{clinic.name}</TableCell>
                          <TableCell>{clinic.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {planLabels[clinic.subscriptionPlan]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[clinic.subscriptionStatus]}>
                              {statusLabels[clinic.subscriptionStatus]}
                            </Badge>
                          </TableCell>
                          <TableCell>{clinic.createdAt}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-accent hover:bg-accent/90 gap-1"
                                onClick={() => setLocation(`/super-admin/clinic/${clinic.id}`)}
                              >
                                إدارة
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClinic(clinic)}
                                className="gap-1"
                              >
                                <Edit2 className="w-4 h-4" />
                                تعديل
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteClinic(clinic.id)}
                                className="gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                حذف
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>التحليلات</CardTitle>
                <CardDescription>إحصائيات النظام الشاملة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">معدل التحويل</p>
                    <p className="text-2xl font-bold text-accent">
                      {((stats.activeClinics / stats.totalClinics) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">متوسط الإيرادات</p>
                    <p className="text-2xl font-bold text-accent">
                      {stats.activeClinics > 0
                        ? (stats.revenue / stats.activeClinics / 1000).toFixed(0)
                        : 0}
                      K د.ع
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل بيانات العيادة</DialogTitle>
            <DialogDescription>{editingClinic?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Plan Selection */}
            <div className="space-y-2">
              <Label>الخطة</Label>
              <Select value={newPlan} onValueChange={(value: any) => setNewPlan(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">مجاني</SelectItem>
                  <SelectItem value="basic">أساسي (25,000 د.ع)</SelectItem>
                  <SelectItem value="professional">احترافي (60,000 د.ع)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <Label>حالة الاشتراك</Label>
              <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="trial">تجريبي</SelectItem>
                  <SelectItem value="suspended">موقوف</SelectItem>
                  <SelectItem value="cancelled">ملغى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف ملاحظات حول هذه العيادة..."
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground min-h-24"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleSaveClinic} className="flex-1">
                حفظ التغييرات
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
