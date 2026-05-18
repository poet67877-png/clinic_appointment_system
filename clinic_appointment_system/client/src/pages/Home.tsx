import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Calendar, Users, CheckCircle2 } from "lucide-react";

export default function Home() {
  const { data: doctors, isLoading: doctorsLoading } = trpc.clinic.doctors.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.clinic.getStats.useQuery();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-accent">عيادة النور</h1>
              <p className="text-muted-foreground mt-2">نظام حجز المواعيد الطبية</p>
            </div>
            <Link href="/admin/login">
              <Button variant="outline" className="ml-4">
                دخول المسؤول
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">احجز موعدك الآن</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            احصل على أفضل الخدمات الطبية من فريق متخصص وذو خبرة عالية
          </p>
          <Link href="/book">
            <Button size="lg" className="bg-accent hover:bg-blue-600 text-accent-foreground">
              <Calendar className="mr-2 h-5 w-5" />
              احجز موعد جديد
            </Button>
          </Link>
        </div>
      </section>

      {/* Statistics Section */}
      {!statsLoading && stats && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold mb-8 text-center">إحصائيات العيادة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="clinic-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    إجمالي المواعيد
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-accent">{stats.total}</p>
                </CardContent>
              </Card>

              <Card className="clinic-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    المواعيد المؤكدة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-500">{stats.confirmed}</p>
                </CardContent>
              </Card>

              <Card className="clinic-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-yellow-500" />
                    المواعيد المعلقة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Doctors Section */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-8 text-center">فريق الأطباء</h3>
          {doctorsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {doctors?.map((doctor) => (
                <Card key={doctor.id} className="clinic-card hover:shadow-2xl transition-all">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Users className="h-5 w-5 text-accent" />
                      {doctor.name}
                    </CardTitle>
                    <CardDescription>{doctor.specialty}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {doctor.phone && `الهاتف: ${doctor.phone}`}
                    </p>
                    <Link href={`/book?doctor=${doctor.id}`}>
                      <Button className="w-full clinic-button-primary">
                        احجز مع {doctor.name.split(" ")[1]}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-accent to-cyan-500">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">هل تريد الاستفسار عن موعدك؟</h3>
          <p className="text-white/90 mb-6">ادخل رقم هاتفك لعرض جميع مواعيدك</p>
          <Link href="/appointments">
            <Button size="lg" variant="secondary" className="bg-white text-accent hover:bg-gray-100">
              عرض مواعيدي
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 عيادة النور. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
