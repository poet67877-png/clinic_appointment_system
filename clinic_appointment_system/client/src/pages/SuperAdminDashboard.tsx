import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, Users, DollarSign, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user || user.role !== "superadmin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  const statsQuery = trpc.admin.getDashboardStats.useQuery();
  const clinicsQuery = trpc.admin.getAllClinics.useQuery();
  const revenueByPlanQuery = trpc.admin.getRevenueByPlan.useQuery();
  const monthlyRevenueQuery = trpc.admin.getMonthlyRevenue.useQuery({ months: 12 });
  const subscriptionStatusQuery = trpc.admin.getClinicSubscriptionStatus.useQuery();
  const pendingInvoicesQuery = trpc.admin.getPendingInvoices.useQuery();

  if (!user || user.role !== "superadmin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">لوحة تحكم المالك</h1>
          <p className="text-muted-foreground">مراقبة شاملة للمنصة والإيرادات</p>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Clinics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي العيادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{statsQuery.data?.totalClinics}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    معدل التحويل: {statsQuery.data?.conversionRate}%
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Active Subscriptions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                الاشتراكات النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{statsQuery.data?.activeSubscriptions}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    تجريبية: {statsQuery.data?.trialSubscriptions}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                إجمالي الإيرادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {(statsQuery.data?.totalRevenue || 0).toLocaleString("ar-IQ")} د.ع
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">من الفواتير المدفوعة</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pending Amount */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                المبالغ المعلقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-orange-600">
                    {(statsQuery.data?.pendingAmount || 0).toLocaleString("ar-IQ")} د.ع
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">بانتظار الدفع</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="clinics">العيادات</TabsTrigger>
            <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
            <TabsTrigger value="invoices">الفواتير</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle>حالة الاشتراكات</CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptionStatusQuery.isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {subscriptionStatusQuery.data?.trial}
                      </div>
                      <p className="text-sm text-muted-foreground">تجريبية</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {subscriptionStatusQuery.data?.active}
                      </div>
                      <p className="text-sm text-muted-foreground">نشطة</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">
                        {subscriptionStatusQuery.data?.paused}
                      </div>
                      <p className="text-sm text-muted-foreground">موقوفة</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {subscriptionStatusQuery.data?.cancelled}
                      </div>
                      <p className="text-sm text-muted-foreground">ملغاة</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue by Plan */}
            <Card>
              <CardHeader>
                <CardTitle>الإيرادات حسب الخطة</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueByPlanQuery.isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <div className="space-y-4">
                    {revenueByPlanQuery.data?.map((item) => (
                      <div key={item.planName} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.planName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.invoiceCount} فاتورة
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {item.revenue.toLocaleString("ar-IQ")} د.ع
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clinics Tab */}
          <TabsContent value="clinics">
            {clinicsQuery.isLoading ? (
              <Card>
                <CardContent className="p-8 flex justify-center">
                  <Loader2 className="animate-spin" />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {clinicsQuery.data?.map((clinic) => (
                  <Card key={clinic.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{clinic.name}</CardTitle>
                          <CardDescription>{clinic.slug}</CardDescription>
                        </div>
                        <Badge variant={clinic.isActive ? "default" : "secondary"}>
                          {clinic.isActive ? "نشطة" : "موقوفة"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                          <p className="font-medium">{clinic.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">النطاق الفرعي</p>
                          <p className="font-medium">{clinic.subdomain}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
                          <p className="font-medium">
                            {new Date(clinic.createdAt).toLocaleDateString("ar-IQ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">الحالة</p>
                          <p className="font-medium">{clinic.isActive ? "نشطة" : "موقوفة"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>الإيرادات الشهرية (آخر 12 شهر)</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyRevenueQuery.isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <div className="space-y-4">
                    {monthlyRevenueQuery.data?.map((item) => (
                      <div key={item.month} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.month}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.invoiceCount} فاتورة
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {item.revenue.toLocaleString("ar-IQ")} د.ع
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>الفواتير المعلقة</CardTitle>
                <CardDescription>الفواتير التي لم تُدفع بعد</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingInvoicesQuery.isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : pendingInvoicesQuery.data && pendingInvoicesQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {pendingInvoicesQuery.data.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex justify-between items-center p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            تاريخ الاستحقاق:{" "}
                            {invoice.dueDate
                              ? new Date(invoice.dueDate).toLocaleDateString("ar-IQ")
                              : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {(invoice.amount / 100).toLocaleString("ar-IQ")} د.ع
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">لا توجد فواتير معلقة</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
