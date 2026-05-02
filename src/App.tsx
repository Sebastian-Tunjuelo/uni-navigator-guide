import { lazy, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileShell } from "@/components/layout/MobileShell";
import { queryClient } from "@/lib/queryClient";

const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const SubjectDetail = lazy(() => import("./pages/SubjectDetail"));
const Carnet = lazy(() => import("./pages/Carnet"));
const Mapa = lazy(() => import("./pages/Mapa"));
const Chats = lazy(() => import("./pages/Chats"));
const GroupChat = lazy(() => import("./pages/GroupChat"));
const BotChat = lazy(() => import("./pages/BotChat"));
const Perfil = lazy(() => import("./pages/Perfil"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<MobileShell />}>
              <Route path="/" element={<Home />} />
              <Route path="/asignatura/:id" element={<SubjectDetail />} />
              <Route path="/carnet" element={<Carnet />} />
              <Route path="/mapa" element={<Mapa />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/chats/grupo" element={<GroupChat />} />
              <Route path="/chats/bot" element={<BotChat />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
