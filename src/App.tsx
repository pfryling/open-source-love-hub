
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import AddProject from "./pages/AddProject";
import MyProjects from "./pages/MyProjects";
import Verify from "./pages/Verify";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { WaitlistProvider } from "./contexts/WaitlistContext";
import { AuthProvider } from "./contexts/AuthContext";
import WaitlistGuard from "./components/WaitlistGuard";
import AuthGuard from "./components/AuthGuard";
import PreviewMessage from "./components/PreviewMessage";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <WaitlistProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route 
                    path="/add-project" 
                    element={
                      <AuthGuard 
                        requireAuth
                        fallback={<PreviewMessage action="add projects" />}
                      >
                        <WaitlistGuard 
                          requireVerified 
                          fallback={<PreviewMessage action="add projects" />}
                        >
                          <AddProject />
                        </WaitlistGuard>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/my-projects" 
                    element={
                      <AuthGuard 
                        requireAuth
                        fallback={<PreviewMessage action="manage your projects" />}
                      >
                        <MyProjects />
                      </AuthGuard>
                    } 
                  />
                  <Route path="/verify" element={<Verify />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </WaitlistProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
