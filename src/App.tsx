
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
import WaitlistGuard from "./components/WaitlistGuard";
import PreviewMessage from "./components/PreviewMessage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
                    <WaitlistGuard 
                      requireVerified 
                      fallback={<PreviewMessage action="add projects" />}
                    >
                      <AddProject />
                    </WaitlistGuard>
                  } 
                />
                <Route 
                  path="/my-projects" 
                  element={
                    <MyProjects />
                  } 
                />
                <Route path="/verify" element={<Verify />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </WaitlistProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
