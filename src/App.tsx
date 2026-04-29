import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileShell } from "@/components/layout/MobileShell";
import Login from "./pages/Login";
import Home from "./pages/Home";
import SubjectDetail from "./pages/SubjectDetail";
import Carnet from "./pages/Carnet";
import Mapa from "./pages/Mapa";
import Chats from "./pages/Chats";
import GroupChat from "./pages/GroupChat";
import BotChat from "./pages/BotChat";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
