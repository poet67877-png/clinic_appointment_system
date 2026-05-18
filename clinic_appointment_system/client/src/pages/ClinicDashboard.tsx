import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Users, TrendingUp, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import ClinicQRCode from "@/components/ClinicQRCode";

export default function ClinicDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="clinic-card max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              يجب تسجيل الدخول أولاً
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">لوحة تحكم العيادة</h1>
          <p className="text-muted-foreground">إدارة مواعيدك وأطبائك والإحصائيات</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="clinic-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المواعيد اليوم</p>
                  <p className="text-3xl font-bold text-accent">0</p>
                </div>
                <Calendar className="h-8 w-8 text-accent/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="clinic-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الأطباء</p>
                  <p className="text-3xl font-bold text-accent">0</p>
                </div>
                <Users className="h-8 w-8 text-accent/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="clinic-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">معدل الحجز</p>
                  <p className="text-3xl font-bold text-accent">0%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-accent/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 clinic-tabs">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="appointments">المواعيد</TabsTrigger>
            <TabsTrigger value="doctors">الأطباء</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="clinic-card">
              <CardHeader>
                <CardTitle>ملخص النشاط</CardTitle>
                <CardDescription>إحصائيات العيادة للأسبوع الحالي</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  لا توجد بيانات حالياً
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <Card className="clinic-card">
              <CardHeader>
                <CardTitle>المواعيد</CardTitle>
                <CardDescription>قائمة جميع مواعيد العيادة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  لا توجد مواعيد حالياً
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors" className="space-y-4">
            <Card className="clinic-card">
              <CardHeader>
                <CardTitle>الأطباء</CardTitle>
                <CardDescription>إدارة أطباء العيادة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  لا يوجد أطباء مسجلين حالياً
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="clinic-card">
              <CardHeader>
                <CardTitle>إعدادات العيادة</CardTitle>
                <CardDescription>إدارة إعدادات العيادة والحساب</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-semibold">اسم العيادة</p>
                    <p className="text-sm text-muted-foreground">تحديث اسم العيادة</p>
                  </div>
                  <Button variant="outline" className="clinic-button-secondary">
                    <Settings className="h-4 w-4 mr-2" />
                    تعديل
                  </Button>
                </div>
                <ClinicQRCode
                  clinicSlug="عيادة-النور"
                  clinicName="عيادة النور"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
