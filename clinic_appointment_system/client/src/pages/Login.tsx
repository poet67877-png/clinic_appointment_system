import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Login() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();

  if (!loading && user) {
    navigate("/dashboard");
    return null;
  }

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/dashboard");
    },
    onError: (e) => setError(e.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/dashboard");
    },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = () => {
    setError("");
    if (tab === "login") {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ name, email, password });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 rounded-lg border border-border bg-card">
        <h1 className="text-2xl font-bold text-center mb-2 text-primary">ClinicPlus</h1>

        <div className="flex mb-6 border border-border rounded-md overflow-hidden">
          <button
            onClick={() => { setTab("login"); setError(""); }}
            className={`flex-1 py-2 text-sm font-medium ${tab === "login" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => { setTab("register"); setError(""); }}
            className={`flex-1 py-2 text-sm font-medium ${tab === "register" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
          >
            حساب جديد
          </button>
        </div>

        <div className="space-y-4">
          {tab === "register" && (
            <div>
              <label className="block text-sm font-medium mb-1">الاسم</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                placeholder="اسمك الكامل"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "جاري التحميل..." : tab === "login" ? "دخول" : "إنشاء حساب"}
          </button>
        </div>
      </div>
    </div>
  );
}
