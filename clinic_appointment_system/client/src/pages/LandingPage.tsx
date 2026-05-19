import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, Users, BarChart3, Zap, Shield, Smartphone, 
  ArrowRight, Check, Star 
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
    

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const plans = [
    {
      name: "مجاني",
      price: "0",
      description: "للعيادات الناشئة",
      features: [
        "حتى 3 أطباء",
        "100 موعد شهري",
        "إدارة أساسية",
        "دعم البريد الإلكتروني",
      ],
      cta: "ابدأ مجاناً",
      highlighted: false,
    },
    {
      name: "أساسي",
      price: "25,000",
      description: "للعيادات المتوسطة",
      features: [
        "حتى 10 أطباء",
        "500 موعد شهري",
        "تقارير متقدمة",
        "دعم الأولوية",
        "تخصيص كامل",
      ],
      cta: "اختر الخطة",
      highlighted: true,
    },
    {
      name: "احترافي",
      price: "60,000",
      description: "للعيادات الكبيرة",
      features: [
        "أطباء غير محدود",
        "مواعيد غير محدودة",
        "تقارير مخصصة",
        "دعم 24/7",
        "API متقدم",
        "تكامل مع الأنظمة الأخرى",
      ],
      cta: "اختر الخطة",
      highlighted: false,
    },
  ];

  const features = [
    {
      icon: Calendar,
      title: "حجز المواعيد",
      description: "نظام حجز سهل وسريع للمرضى مع تأكيدات فورية",
    },
    {
      icon: Users,
      title: "إدارة الأطباء",
      description: "أضف وأدر أطباءك بسهولة مع تحديد الأوقات المتاحة",
    },
    {
      icon: BarChart3,
      title: "تقارير متقدمة",
      description: "احصل على إحصائيات مفصلة عن أداء عيادتك",
    },
    {
      icon: Zap,
      title: "سرعة عالية",
      description: "نظام سريع وموثوق مع وقت تحميل أقل من ثانية",
    },
    {
      icon: Shield,
      title: "أمان عالي",
      description: "بيانات آمنة ومشفرة مع نسخ احتياطية يومية",
    },
    {
      icon: Smartphone,
      title: "متوافق مع الجوال",
      description: "واجهة مثالية على جميع الأجهزة والشاشات",
    },
  ];

  const testimonials = [
    {
      name: "د. أحمد الخزاعي",
      clinic: "عيادة الخزاعي",
      text: "نظام ممتاز وسهل الاستخدام. زادت كفاءة عيادتنا بنسبة 40%",
      rating: 5,
    },
    {
      name: "د. سارة المحمد",
      clinic: "عيادة الأسنان المتقدمة",
      text: "الدعم الفني رائع والتقارير تساعدنا في اتخاذ القرارات",
      rating: 5,
    },
    {
      name: "د. علي الجبوري",
      clinic: "عيادة الجلدية",
      text: "أفضل استثمار قمنا به. المرضى يحبون سهولة الحجز",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold">CP</span>
            </div>
            <span className="text-xl font-bold text-accent">ClinicPlus</span>
          </div>
          <div className="flex gap-4">
            {user ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/clinic/dashboard")}
                  className="clinic-button-secondary"
                >
                  لوحة التحكم
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="clinic-button-secondary"
                >
                  دخول
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="clinic-button-primary"
                >
                  تسجيل جديد
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-accent/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-accent">
            ClinicPlus
          </h1>
          <p className="text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            منصة إدارة المواعيد الطبية الأفضل
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
            نظام شامل لإدارة عيادتك - حجز مواعيد، إدارة أطباء، تقارير متقدمة، وأكثر
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="clinic-button-primary text-lg"
            >
              ابدأ مجاناً
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="clinic-button-secondary text-lg"
            >
              اعرف المزيد
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-accent">
            المميزات الرئيسية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="clinic-card">
                  <CardContent className="pt-6">
                    <Icon className="h-12 w-12 text-accent mb-4" />
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-accent">
            الخطط والأسعار
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`clinic-card transition-all ${
                  plan.highlighted ? "ring-2 ring-accent scale-105" : ""
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <span className="text-4xl font-bold text-accent">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground mr-2">د.ع/شهري</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-accent" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => navigate("/register")}
                    className={`w-full ${
                      plan.highlighted
                        ? "clinic-button-primary"
                        : "clinic-button-secondary"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-accent">
            آراء العملاء
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="clinic-card">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-accent text-accent"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.clinic}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent to-cyan-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-accent-foreground">
            جاهز لتطوير عيادتك؟
          </h2>
          <p className="text-xl text-accent-foreground/90 mb-8">
            انضم إلى مئات العيادات التي تثق بـ ClinicPlus
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="bg-accent-foreground text-accent hover:bg-accent-foreground/90 text-lg"
          >
            ابدأ الآن مجاناً
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">ClinicPlus</h3>
              <p className="text-muted-foreground text-sm">
                منصة إدارة المواعيد الطبية الموثوقة
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">المنتج</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent">المميزات</a></li>
                <li><a href="#" className="hover:text-accent">الأسعار</a></li>
                <li><a href="#" className="hover:text-accent">الأمان</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الشركة</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent">عن الشركة</a></li>
                <li><a href="#" className="hover:text-accent">المدونة</a></li>
                <li><a href="#" className="hover:text-accent">التواصل</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">القانوني</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent">الخصوصية</a></li>
                <li><a href="#" className="hover:text-accent">الشروط</a></li>
                <li><a href="#" className="hover:text-accent">الاستخدام</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 ClinicPlus. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
