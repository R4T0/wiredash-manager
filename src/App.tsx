
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ApiLogsProvider } from "@/contexts/ApiLogsContext";
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";
import Peers from "./pages/Peers";
import Interfaces from "./pages/Interfaces";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ApiLogsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/peers" element={<Peers />} />
            <Route path="/interfaces" element={<Interfaces />} />
            <Route path="/qrcode" element={<Generate />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ApiLogsProvider>
  </QueryClientProvider>
);

export default App;
