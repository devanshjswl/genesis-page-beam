import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminAuth = lazy(() => import("./pages/auth/AdminAuth"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin/auth" element={<AdminAuth />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminMessages />} />
                <Route path="projects" element={<AdminProjects />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
