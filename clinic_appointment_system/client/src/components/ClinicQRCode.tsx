import { useRef } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

interface ClinicQRCodeProps {
  clinicSlug: string;
  clinicName: string;
  baseUrl?: string;
}

export default function ClinicQRCode({
  clinicSlug,
  clinicName,
  baseUrl = typeof window !== "undefined" ? window.location.origin : "https://clinicplus.iq",
}: ClinicQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate QR code URL
  const qrUrl = `${baseUrl}/${clinicSlug}`;

  // Download QR Code as image
  const handleDownload = async () => {
    try {
      const svg = qrRef.current?.querySelector("svg");
      if (!svg) {
        toast.error("فشل في إنشاء QR Code");
        return;
      }

      // Convert SVG to canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        // Download
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `${clinicSlug}-qr-code.png`;
        link.click();
        toast.success("تم تحميل QR Code بنجاح");
      };

      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    } catch (error) {
      toast.error("خطأ في تحميل QR Code");
      console.error(error);
    }
  };

  // Print QR Code
  const handlePrint = () => {
    try {
      const printWindow = window.open("", "", "height=500,width=500");
      if (!printWindow) {
        toast.error("فشل في فتح نافذة الطباعة");
        return;
      }

      const svg = qrRef.current?.querySelector("svg");
      if (!svg) {
        toast.error("فشل في إنشاء QR Code");
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
          <head>
            <title>طباعة QR Code - ${clinicName}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: Arial, sans-serif;
                background: white;
                margin: 0;
                padding: 20px;
              }
              .container {
                text-align: center;
              }
              h1 {
                margin-bottom: 20px;
                color: #333;
              }
              .qr-container {
                background: white;
                padding: 20px;
                border: 2px solid #ddd;
                border-radius: 8px;
                display: inline-block;
              }
              .url {
                margin-top: 20px;
                font-size: 14px;
                color: #666;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${clinicName}</h1>
              <div class="qr-container">
                ${svgData}
              </div>
              <div class="url">
                <p>امسح الكود للذهاب إلى صفحة الحجز</p>
                <p>${qrUrl}</p>
              </div>
            </div>
            <script>
              window.print();
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success("تم فتح نافذة الطباعة");
    } catch (error) {
      toast.error("خطأ في الطباعة");
      console.error(error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>QR Code للعيادة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex justify-center p-6 bg-muted rounded-lg">
          <div ref={qrRef} className="bg-white p-4 rounded">
            <QRCode
              value={qrUrl}
              size={256}
              level="H"
              fgColor="#000000"
              bgColor="#FFFFFF"
            />
          </div>
        </div>

        {/* QR Code URL */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">رابط QR Code:</p>
          <p className="text-sm font-mono bg-muted p-2 rounded break-all">
            {qrUrl}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleDownload}
            className="gap-2"
            variant="default"
          >
            <Download className="w-4 h-4" />
            تحميل
          </Button>
          <Button
            onClick={handlePrint}
            className="gap-2"
            variant="outline"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-semibold">تعليمات الاستخدام:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>امسح هذا الكود ليتم توجيهك لصفحة حجز العيادة</li>
            <li>يمكنك تحميل الكود وطباعته في عيادتك</li>
            <li>ضع الكود في مكان ظاهر للمرضى</li>
            <li>يعمل الكود على جميع الأجهزة الذكية</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
