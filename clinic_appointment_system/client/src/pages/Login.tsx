import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@lib/trpc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      navigate("/dashboard");
    },
    onError: () => {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 rounded-lg border border-border bg-card">
        <h1 className="text-2xl font-bold text-center mb-2 text-primary">ClinicPlus</h1>
        <p className="text-center text-muted-foreground mb-6">تسجيل الدخول</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "جاري التحميل..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
