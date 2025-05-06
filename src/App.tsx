import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoanProvider } from "@/contexts/LoanContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useEffect } from "react";
import { UserLoanDetailPage } from "./pages/UserLoanDetailPage";

const queryClient = new QueryClient();

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.user) || {};

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { data } = await axios.get("http://localhost:8080/api/user/me", {
        withCredentials: true,
        headers: {
          Accept: "application/json",
        },
      });

      if (data) {
        dispatch({ type: "SET_USER", payload: data });
      }
    } catch (error) {
      console.error(error);
      dispatch({ type: "SET_USER", payload: null });
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LoanProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route
                    path="/"
                    element={
                      // <RequireAuth>
                      <Index />
                      // </RequireAuth>
                    }
                  />
                  <Route
                    path="/api/userdetail/:id"
                    element={<UserLoanDetailPage />}
                  />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </LoanProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
export default App;
