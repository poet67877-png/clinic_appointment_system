import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function SubscriptionManagement() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [clinicId, setClinicId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setLocation("/");
      return;
    }
    // Get clinicId from context or localStorage
    const storedClinicId = localStorage.getItem("clinicId");
    if (storedClinicId) {
      setClinicId(parseInt(storedClinicId));
    }
  }, [user, setLocation]);

  const subscriptionQuery = trpc.subscriptions.getSubscription.useQuery(
    { clinicId: clinicId || 0 },
    { enabled: !!clinicId }
  );

  const invoicesQuery = trpc.subscriptions.getInvoices.useQuery(
    { clinicId: clinicId || 0 },
    { enabled: !!clinicId }
  );

  const trialStatusQuery = trpc.subscriptions.checkTrialStatus.useQuery(
    { clinicId: clinicId || 0 },
    { enabled: !!clinicId }
  );

  const upgradePlanMutation = trpc.subscriptions.upgradePlan.useMutation();
  const recordPaymentMutation = trpc.subscriptions.recordPayment.useMutation();

  const handleUpgradePlan = async (planId: number) => {
    if (!clinicId) return;

    try {
      await upgradePlanMutation.mutateAsync({
        clinicId,
        planId,
      });
      toast.success("تم ترقية الخطة بنجاح!");
      subscriptionQuery.refetch();
    } catch (error) {
      toast.error("حدث خطأ في ترقية الخطة");
    }
  };

  const handleRecordPayment = async (invoiceId: number) => {
    if (!clinicId) return;

    try {
      await recordPaymentMutation.mutateAsync({
        invoiceId,
        clinicId,
        amount: 50000, // Example amount
        paymentMethod: "bank_transfer",
        transactionId: `TXN-${Date.now()}`,
      });
      toast.success("تم تسجيل الدفع بنجاح!");
      invoicesQuery.refetch();
    } catch (error) {
      toast.error("حدث خطأ في تسجيل الدفع");
    }
  };

  if (!clinicId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>جاري التحميل...</CardTitle>
          </CardHeader>
          <CardContent>
            <Loader2 className="animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">إدارة الاشتراك</h1>
          <p className="text-muted-foreground">
            إدارة خطتك والفواتير والدفعات
          </p>
        </div>

        {/* Trial Status */}
        {trialStatusQuery.data?.isTrialActive && (
          <Card className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                فترة تجريبية نشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-2">
                لديك <strong>{trialStatusQuery.data.daysRemaining}</strong> أيام متبقية من الفترة التجريبية المجانية
              </p>
              <p className="text-sm text-muted-foreground">
                انتهاء الفترة التجريبية: {trialStatusQuery.data.trialEndDate ? new Date(trialStatusQuery.data.trialEndDate).toLocaleDateString("ar-IQ") : ""}
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscription">الاشتراك الحالي</TabsTrigger>
            <TabsTrigger value="invoices">الفواتير</TabsTrigger>
            <TabsTrigger value="plans">الخطط</TabsTrigger>
          </TabsList>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            {subscriptionQuery.isLoading ? (
              <Card>
                <CardContent className="p-8 flex justify-center">
                  <Loader2 className="animate-spin" />
                </CardContent>
              </Card>
            ) : subscriptionQuery.data ? (
              <Card>
                <CardHeader>
                  <CardTitle>الخطة الحالية</CardTitle>
                  <CardDescription>
                    {subscriptionQuery.data.plan?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">الحالة</p>
                      <Badge className="mt-1">
                        {subscriptionQuery.data.subscription.status === "trial"
                          ? "تجريبية"
                          : subscriptionQuery.data.subscription.status === "active"
                          ? "نشطة"
                          : "موقوفة"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">السعر الشهري</p>
                      <p className="text-lg font-semibold">
                        {subscriptionQuery.data.plan?.price
                          ? `${subscriptionQuery.data.plan.price / 100} د.ع`
                          : "مجاني"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">عدد الأطباء</p>
                      <p className="text-lg font-semibold">
                        {subscriptionQuery.data.plan?.maxDoctors}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">المواعيد الشهرية</p>
                      <p className="text-lg font-semibold">
                        {subscriptionQuery.data.plan?.maxAppointmentsPerMonth}
                      </p>
                    </div>
                  </div>

                  {subscriptionQuery.data.subscription.status === "trial" && (
                    <Button className="w-full">
                      ترقية الخطة الآن
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            {invoicesQuery.isLoading ? (
              <Card>
                <CardContent className="p-8 flex justify-center">
                  <Loader2 className="animate-spin" />
                </CardContent>
              </Card>
            ) : invoicesQuery.data && invoicesQuery.data.length > 0 ? (
              <div className="space-y-4">
                {invoicesQuery.data.map((invoice) => (
                  <Card key={invoice.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{invoice.invoiceNumber}</CardTitle>
                          <CardDescription>
                            {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString("ar-IQ") : ""}
                          </CardDescription>
                        </div>
                        <Badge variant={
                          invoice.status === "paid"
                            ? "default"
                            : invoice.status === "overdue"
                            ? "destructive"
                            : "secondary"
                        }>
                          {invoice.status === "paid"
                            ? "مدفوعة"
                            : invoice.status === "overdue"
                            ? "متأخرة"
                            : "قيد الانتظار"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">المبلغ:</span>
                        <span className="font-semibold">
                          {invoice.amount / 100} د.ع
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">تاريخ الاستحقاق:</span>
                        <span>
                          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("ar-IQ") : ""}
                        </span>
                      </div>

                      {invoice.status !== "paid" && (
                        <Button
                          onClick={() => handleRecordPayment(invoice.id)}
                          disabled={recordPaymentMutation.isPending}
                          className="w-full"
                        >
                          {recordPaymentMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              جاري التسجيل...
                            </>
                          ) : (
                            "تسجيل الدفع"
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">لا توجد فواتير</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>مجاني</CardTitle>
                  <CardDescription>للعيادات الناشئة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">0 د.ع</div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>5 أطباء</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>500 موعد شهري</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>لوحة تحكم أساسية</span>
                    </li>
                  </ul>
                  {subscriptionQuery.data?.subscription.planId === 1 ? (
                    <Badge>الخطة الحالية</Badge>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleUpgradePlan(1)}
                      disabled={upgradePlanMutation.isPending}
                    >
                      اختيار هذه الخطة
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Basic Plan */}
              <Card className="border-blue-500">
                <CardHeader>
                  <CardTitle>أساسي</CardTitle>
                  <CardDescription>للعيادات المتوسطة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">25,000 د.ع</div>
                  <p className="text-sm text-muted-foreground">شهري</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>20 طبيب</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>2000 موعد شهري</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>تقارير متقدمة</span>
                    </li>
                  </ul>
                  {subscriptionQuery.data?.subscription.planId === 2 ? (
                    <Badge>الخطة الحالية</Badge>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgradePlan(2)}
                      disabled={upgradePlanMutation.isPending}
                    >
                      ترقية إلى هذه الخطة
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Professional Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>احترافي</CardTitle>
                  <CardDescription>للعيادات الكبيرة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">60,000 د.ع</div>
                  <p className="text-sm text-muted-foreground">شهري</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>أطباء غير محدود</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>مواعيد غير محدودة</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>دعم أولوي 24/7</span>
                    </li>
                  </ul>
                  {subscriptionQuery.data?.subscription.planId === 3 ? (
                    <Badge>الخطة الحالية</Badge>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgradePlan(3)}
                      disabled={upgradePlanMutation.isPending}
                    >
                      ترقية إلى هذه الخطة
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
