import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { BettingProvider } from "@/hooks/use-betting";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import AdminPage from "@/pages/admin-page";
import TermsPage from "@/pages/terms-page";
import AboutPage from "@/pages/about-page";
import PrivacyPage from "@/pages/privacy-page";
import HelpPage from "@/pages/help-page";
import ContactPage from "@/pages/contact-page";
import ResponsibleGamingPage from "@/pages/responsible-gaming-page";
import FAQPage from "@/pages/faq-page";
import BankingGuidePage from "@/pages/banking-guide-page";
import PromotionsPage from "@/pages/promotions-page";
import NotFound from "@/pages/not-found";
import SupportPage from "@/pages/support-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/help" component={HelpPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/responsible-gaming" component={ResponsibleGamingPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/banking-guide" component={BankingGuidePage} />
      <Route path="/promotions" component={PromotionsPage} />
      <Route path="/support" component={SupportPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <BettingProvider>
              <div className="min-h-screen bg-background text-foreground">
                <Toaster />
                <Router />
              </div>
            </BettingProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
