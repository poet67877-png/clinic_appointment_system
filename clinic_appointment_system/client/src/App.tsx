import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
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

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={LandingPage} />
      <Route path={"/home"} component={Home} />
      <Route path={"/book"} component={BookAppointment} />
      <Route path={"/confirmation"} component={Confirmation} />
      <Route path={"/appointments"} component={ViewAppointments} />
      <Route path={"/register"} component={RegisterClinic} />
      <Route path={"/admin/super"} component={SuperAdminDashboard} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/clinic/dashboard"} component={ClinicDashboard} />
      <Route path={"/clinic/settings"} component={ClinicSettings} />
      <Route path={"/clinic/subscription"} component={SubscriptionManagement} />
      <Route path={"/clinic/customization"} component={ClinicCustomization} />
      <Route path={"/super-admin/login"} component={SuperAdminLogin} />
      <Route path={"/super-admin/dashboard"} component={SuperAdminDashboard2} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <WhatsAppButton />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
