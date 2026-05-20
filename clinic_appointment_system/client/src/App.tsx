import { Toaster } from "@components/ui/sonner";
import { TooltipProvider } from "@components/ui/tooltip";
import NotFound from "@pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import WhatsAppButton from "./components/WhatsAppButton";
import BookAppointment from "./pages/BookAppointment";
import Confirmation from "./pages/Confirmation";
import ViewAppointments from "./pages/ViewAppointments";
import RegisterClinic from "./pages/RegisterClinic";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ClinicDashboard from "./pages/ClinicDashboard";
import LandingPage from "./pages/LandingPage";
import ClinicSettings from "./pages/ClinicSettings";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import AdminDashboard from "./pages/AdminDashboard";
import ClinicCustomization from "./pages/ClinicCustomization";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminDashboard2 from "./pages/SuperAdminDashboard2";
import Login from "./pages/Login";

export default function Router() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/login" component={Login} />
            <Route path="/home" component={Home} />
            <Route path="/book/:clinicId" component={BookAppointment} />
            <Route path="/confirmation" component={Confirmation} />
            <Route path="/appointments" component={ViewAppointments} />
            <Route path="/register" component={RegisterClinic} />
            <Route path="/dashboard" component={ClinicDashboard} />
            <Route path="/settings" component={ClinicSettings} />
            <Route path="/subscription" component={SubscriptionManagement} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/clinic-customization" component={ClinicCustomization} />
            <Route path="/super-admin/login" component={SuperAdminLogin} />
            <Route path="/super-admin/dashboard" component={SuperAdminDashboard} />
            <Route path="/super-admin/dashboard2" component={SuperAdminDashboard2} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
          <WhatsAppButton />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
