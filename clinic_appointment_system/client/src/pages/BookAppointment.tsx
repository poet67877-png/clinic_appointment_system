import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4;

export default function BookAppointment() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>("");

  const { data: doctors, isLoading: doctorsLoading } = trpc.clinic.doctors.useQuery();
  const { data: timeSlots, isLoading: slotsLoading } = trpc.clinic.getAvailableSlots.useQuery(
    {
      doctorId: selectedDoctor || 0,
      dayOfWeek: selectedDate ? new Date(selectedDate).getDay() : 0,
    },
    { enabled: !!selectedDoctor && !!selectedDate }
  );

  const bookMutation = trpc.clinic.bookAppointment.useMutation({
    onSuccess: (data) => {
      navigate(`/confirmation?code=${data.confirmationCode}`);
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ في حجز الموعد");
    },
  });

  const handleNextStep = () => {
    if (step === 1 && !selectedDoctor) {
      toast.error("يرجى اختيار طبيب");
      return;
    }
    if (step === 2 && !selectedDate) {
      toast.error("يرجى اختيار تاريخ");
      return;
    }
    if (step === 3 && !selectedTime) {
      toast.error("يرجى اختيار وقت");
      return;
    }
    if (step === 4) {
      if (!patientName.trim()) {
        toast.error("يرجى إدخال اسمك");
        return;
      }
      if (!patientPhone.trim() || patientPhone.length < 10) {
        toast.error("يرجى إدخال رقم هاتف صحيح");
        return;
      }
      handleBookAppointment();
      return;
    }
    setStep((step + 1) as Step);
  };

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error("البيانات غير كاملة");
      return;
    }

    bookMutation.mutate({
      doctorId: selectedDoctor,
      patientName,
      patientPhone,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-accent mb-2">احجز موعدك</h1>
          <p className="text-muted-foreground">الخطوة {step} من 4</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s <= step ? "bg-accent" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <Card className="clinic-card">
            <CardHeader>
              <CardTitle>اختر طبيبك</CardTitle>
              <CardDescription>اختر الطبيب المتخصص الذي تريد حجز موعد معه</CardDescription>
            </CardHeader>
            <CardContent>
              {doctorsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
              ) : (
                <div className="space-y-3">
                  {doctors?.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-right ${
                        selectedDoctor === doctor.id
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <p className="font-semibold">{doctor.name}</p>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Date */}
        {step === 2 && (
          <Card className="clinic-card">
            <CardHeader>
              <CardTitle>اختر التاريخ</CardTitle>
              <CardDescription>اختر التاريخ المناسب لموعدك</CardDescription>
            </CardHeader>
            <CardContent>
              <Label className="clinic-label">التاريخ</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                className="clinic-input"
              />
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select Time */}
        {step === 3 && (
          <Card className="clinic-card">
            <CardHeader>
              <CardTitle>اختر الوقت</CardTitle>
              <CardDescription>اختر الوقت المناسب من الأوقات المتاحة</CardDescription>
            </CardHeader>
            <CardContent>
              {slotsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
              ) : timeSlots && timeSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot: any) => (
                    <button
                      key={slot.id}
                      onClick={() => {
                        const start = slot.startTime as string;
                        setSelectedTime(start);
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTime === slot.startTime
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <p className="font-semibold">{slot.startTime?.slice(0, 5)}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد أوقات متاحة في هذا التاريخ
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Enter Patient Info */}
        {step === 4 && (
          <Card className="clinic-card">
            <CardHeader>
              <CardTitle>بيانات المريض</CardTitle>
              <CardDescription>أدخل بيانات المريض لإتمام الحجز</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="clinic-label">اسم المريض</Label>
                <Input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="أدخل اسمك الكامل"
                  className="clinic-input"
                />
              </div>
              <div>
                <Label className="clinic-label">رقم الهاتف</Label>
                <Input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="أدخل رقم هاتفك"
                  className="clinic-input"
                />
              </div>

              {/* Summary */}
              <div className="bg-muted/50 p-4 rounded-lg mt-6">
                <h4 className="font-semibold mb-3">ملخص الحجز</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">الطبيب:</span>{" "}
                    <span className="font-semibold">
                      {doctors?.find((d) => d.id === selectedDoctor)?.name}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">التاريخ:</span>{" "}
                    <span className="font-semibold">{selectedDate}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">الوقت:</span>{" "}
                    <span className="font-semibold">{selectedTime?.slice(0, 5)}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">الاسم:</span>{" "}
                    <span className="font-semibold">{patientName}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">الهاتف:</span>{" "}
                    <span className="font-semibold">{patientPhone}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setStep((Math.max(1, step - 1) as Step))}
            disabled={step === 1}
            className="flex-1"
          >
            <ChevronRight className="mr-2 h-4 w-4" />
            السابق
          </Button>
          <Button
            onClick={handleNextStep}
            disabled={bookMutation.isPending}
            className="flex-1 clinic-button-primary"
          >
            {bookMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الحجز...
              </>
            ) : step === 4 ? (
              <>
                <span>تأكيد الحجز</span>
              </>
            ) : (
              <>
                التالي
                <ChevronLeft className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
