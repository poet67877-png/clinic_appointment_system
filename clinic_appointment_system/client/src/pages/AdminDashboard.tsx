import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, TrendingUp, AlertCircle, Plus, Edit2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [newNote, setNewNote] = useState("");

  // Redirect if not super admin
  if (user?.role !== "superadmin") {
    navigate("/");
    return null;
  }

  // Fetch data
  const { data: stats } = trpc.superadmin.getDashboardStats.useQuery();
  const { data: clinics } = trpc.superadmin.getAllClinics.useQuery();
  const { data: clinicDetails, refetch: refetchDetails } = trpc.superadmin.getClinicDetails.useQuery(
    { clinicId: selectedClinic || 0 },
    { enabled: !!selectedClinic }
  );

  // Mutations
  const updateSubscriptionMutation = trpc.superadmin.updateClinicSubscription.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الاشتراك بنجاح");
      if (selectedClinic) refetchDetails();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleStatusMutation = trpc.superadmin.toggleClinicStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة العيادة");
      if (selectedClinic) refetchDetails();
    },
  });

  const addNoteMutation = trpc.superadmin.addClinicNote.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الملاحظة");
      setNewNote("");
      if (selectedClinic) {
        refetchDetails();
      }
    },
  });

  const handleAddNote = () => {
    if (!selectedClinic || !newNote.trim()) return;
    addNoteMutation.mutate({ clinicId: selectedClinic, note: newNote });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "trial":
        return "bg-blue-500";
      case "paused":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "نشط",
      trial: "تجريبي",
      paused: "موقوف",
      cancelled: "ملغى",
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">لوحة تحكم Super Admin</h1>
          <p className="text-muted-foreground">مرحباً {user?.name}، إدارة جميع العيادات والاشتراكات</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي العيادات</p>
                    <p className="text-3xl font-bold text-accent">{stats.totalClinics}</p>
                  </div>
                  <Users className="h-12 w-12 text-accent opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">الاشتراكات النشطة</p>
                    <p className="text-3xl font-bold text-green-500">{stats.activeSubscriptions}</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">التجريبية</p>
                    <p className="text-3xl font-bold text-blue-500">{stats.trialSubscriptions}</p>
                  </div>
                  <AlertCircle className="h-12 w-12 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">معدل التحويل</p>
                    <p className="text-3xl font-bold text-accent">{stats.conversionRate}%</p>
                  </div>
                  <BarChart3 className="h-12 w-12 text-accent opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Clinics Table */}
        <Card>
          <CardHeader>
            <CardTitle>العيادات المسجلة</CardTitle>
            <CardDescription>إدارة جميع العيادات والاشتراكات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم العيادة</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>الخطة</TableHead>
                    <TableHead>حالة الاشتراك</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinics?.map((item) => (
                    <TableRow key={item.clinic.id}>
                      <TableCell className="font-semibold">{item.clinic.name}</TableCell>
                      <TableCell>{item.clinic.email}</TableCell>
                      <TableCell>{item.plan?.name || "بدون خطة"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.subscription?.status || "")}>
                          {getStatusLabel(item.subscription?.status || "")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.clinic.isActive ? "default" : "secondary"}>
                          {item.clinic.isActive ? "نشطة" : "معطلة"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedClinic(item.clinic.id)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>إدارة {item.clinic.name}</DialogTitle>
                            </DialogHeader>

                            {clinicDetails && (
                              <div className="space-y-6">
                                {/* Subscription Management */}
                                <div className="space-y-4">
                                  <h3 className="font-semibold">إدارة الاشتراك</h3>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>الخطة</Label>
                                      <Select
                                        defaultValue={clinicDetails.subscription?.planId.toString()}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1">مجاني</SelectItem>
                                          <SelectItem value="2">أساسي</SelectItem>
                                          <SelectItem value="3">احترافي</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label>حالة الاشتراك</Label>
                                      <Select
                                        defaultValue={clinicDetails.subscription?.status}
                                        onValueChange={(value) => {
                                          updateSubscriptionMutation.mutate({
                                            clinicId: clinicDetails.clinic.id,
                                            status: value as any,
                                          });
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="trial">تجريبي</SelectItem>
                                          <SelectItem value="active">نشط</SelectItem>
                                          <SelectItem value="paused">موقوف</SelectItem>
                                          <SelectItem value="cancelled">ملغى</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div>
                                    <Label>تاريخ انتهاء الاشتراك</Label>
                                    <Input type="date" />
                                  </div>

                                  <Button
                                    onClick={() => {
                                      toggleStatusMutation.mutate({
                                        clinicId: clinicDetails.clinic.id,
                                      });
                                    }}
                                    variant="outline"
                                    className="w-full"
                                  >
                                    {clinicDetails.clinic.isActive ? "إيقاف العيادة" : "تفعيل العيادة"}
                                  </Button>
                                </div>

                                {/* Notes Section */}
                                <div className="space-y-4 border-t pt-4">
                                  <h3 className="font-semibold">الملاحظات</h3>

                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {clinicDetails.notes.map((note) => (
                                      <div key={note.id} className="bg-muted p-3 rounded text-sm">
                                        <p>{note.note}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {new Date(note.createdAt).toLocaleString("ar-IQ")}
                                        </p>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="space-y-2">
                                    <Label>إضافة ملاحظة جديدة</Label>
                                    <Textarea
                                      placeholder="اكتب ملاحظتك هنا..."
                                      value={newNote}
                                      onChange={(e) => setNewNote(e.target.value)}
                                    />
                                    <Button onClick={handleAddNote} className="w-full">
                                      <Plus className="w-4 h-4 ml-2" />
                                      إضافة ملاحظة
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
