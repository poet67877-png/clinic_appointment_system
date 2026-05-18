import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Copy, Download, Home } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Confirmation() {
  const [location] = useLocation();
  const [confirmationCode, setConfirmationCode] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    setConfirmationCode(params.get("code") || "");
  }, [location]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(confirmationCode);
    toast.success("تم نسخ رمز التأكيد");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl" />
            <CheckCircle2 className="h-24 w-24 text-accent relative" />
          </div>
        </div>

        {/* Main Card */}
        <Card className="clinic-card mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">تم حجز موعدك بنجاح!</CardTitle>
            <CardDescription className="text-lg mt-2">
              شكراً لاختيارك عيادة النور
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Confirmation Code */}
            <div className="bg-muted/50 p-6 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">رمز التأكيد</p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-mono font-bold text-accent">{confirmationCode}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="ml-auto"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                احفظ هذا الرمز - ستحتاج إليه للتحقق من موعدك
              </p>
            </div>

            {/* Important Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-3">معلومات مهمة</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ سيتم إرسال تذكير لك قبل الموعد بساعة واحدة</li>
                <li>✓ يرجى الحضور قبل الموعد بـ 10 دقائق</li>
                <li>✓ إذا لم تتمكن من الحضور، يرجى الإلغاء مسبقاً</li>
                <li>✓ احتفظ برمز التأكيد لمراجعة موعدك</li>
              </ul>
            </div>

            {/* Next Steps */}
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-3">الخطوات التالية</h4>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>احفظ رمز التأكيد أعلاه</li>
                <li>ستتلقى رسالة تذكير قبل الموعد</li>
                <li>حضّر المستندات الطبية المطلوبة</li>
                <li>تواصل معنا إذا كان لديك أي استفسارات</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            طباعة التأكيد
          </Button>
          <Button
            onClick={() => window.location.href = "/appointments"}
            variant="outline"
            className="flex-1"
          >
            عرض مواعيدي
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            className="flex-1 clinic-button-primary"
          >
            <Home className="mr-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center text-muted-foreground">
          <p className="mb-2">هل تحتاج إلى مساعدة؟</p>
          <p className="text-sm">
            اتصل بنا على <span className="font-semibold text-accent">07700000000</span> أو زرنا مباشرة
          </p>
        </div>
      </div>
    </div>
  );
}
