import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Phone, Calendar, Clock, User, X, Home } from "lucide-react";
import { toast } from "sonner";

export default function ViewAppointments() {
  const [phone, setPhone] = useState<string>("");
  const [searched, setSearched] = useState<boolean>(false);
  const { data: appointments, isLoading, refetch } = trpc.clinic.getAppointmentsByPhone.useQuery(
    { phone },
    { enabled: false }
  );

  const cancelMutation = trpc.clinic.cancelAppointment.useMutation({
    onSuccess: () => {
      toast.success("تم إلغاء الموعد بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ في إلغاء الموعد");
    },
  });

  const handleSearch = () => {
    if (!phone.trim() || phone.length < 10) {
      toast.error("يرجى إدخال رقم هاتف صحيح");
      return;
    }
    setSearched(true);
    refetch();
  };

  const handleCancel = (appointmentId: number) => {
    if (confirm("هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟")) {
      cancelMutation.mutate({ id: appointmentId });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مؤكد":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "معلق":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "ملغى":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-muted/50 text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-accent">مواعيدي</h1>
            <p className="text-muted-foreground mt-2">عرض وإدارة مواعيدك الطبية</p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              الرئيسية
            </Button>
          </Link>
        </div>

        {/* Search Card */}
        <Card className="clinic-card mb-8">
          <CardHeader>
            <CardTitle>ابحث عن مواعيدك</CardTitle>
            <CardDescription>أدخل رقم هاتفك لعرض جميع مواعيدك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="clinic-label">رقم الهاتف</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="أدخل رقم هاتفك"
                  className="clinic-input"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="clinic-button-primary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      بحث...
                    </>
                  ) : (
                    <>البحث</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {searched && (
          <>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : appointments && appointments.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  وجدنا {appointments.length} موعد(مواعيد)
                </p>
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="clinic-card">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">اسم المريض</p>
                            <p className="font-semibold flex items-center gap-2">
                              <User className="h-4 w-4 text-accent" />
                              {appointment.patientName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">التاريخ</p>
                            <p className="font-semibold flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-accent" />
                              {new Date(appointment.appointmentDate).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">الوقت</p>
                            <p className="font-semibold flex items-center gap-2">
                              <Clock className="h-4 w-4 text-accent" />
                              {appointment.appointmentTime?.slice(0, 5)}
                            </p>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">رمز التأكيد</p>
                            <p className="font-mono font-bold text-accent text-sm">
                              {appointment.confirmationCode}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">الحالة</p>
                            <div
                              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                                appointment.status
                              )}`}
                            >
                              {appointment.status}
                            </div>
                          </div>
                          {appointment.status !== "ملغى" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancel(appointment.id)}
                              disabled={cancelMutation.isPending}
                              className="w-full"
                            >
                              {cancelMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  جاري الإلغاء...
                                </>
                              ) : (
                                <>
                                  <X className="mr-2 h-4 w-4" />
                                  إلغاء الموعد
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="clinic-card">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">لم نجد أي مواعيد لهذا الرقم</p>
                  <Link href="/book">
                    <Button className="clinic-button-primary">
                      احجز موعد جديد
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
