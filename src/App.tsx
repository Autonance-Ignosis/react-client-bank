import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoanProvider } from "@/contexts/LoanContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useEffect, useState } from "react";
import { UserLoanDetailPage } from "./pages/UserLoanDetailPage";
import BankMandate from "./pages/BankMandate";
import { MainLayout } from "./components/layout/MainLayout";
import { ThemeProvider } from "./components/layout/ThemeProvider";
import { Dashboard } from "./components/Dashboard";
import ProtectedRoute from "./components/auth/Protection";
import MandateDetails from "./components/MandateDetails";

const queryClient = new QueryClient();

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.user) || {};

  console.log("User in App:", user);

  const isBank = user?.role === "BANK" || false;
  const [bank, setBank] = useState(null);

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
      console.log("User data:", data);
      const { data: bankData } = await axios.get(
        `http://localhost:8080/api/banks/user/${data.id}`,
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
          },
        }
      );
      console.log("Bank data:", bankData);
      if (data && bankData) {
        const userData = {
          ...data,
          bank: bankData,
        };
        dispatch({ type: "SET_USER", payload: userData });
      }
    } catch (error) {
      console.error(error);
      dispatch({ type: "SET_USER", payload: null });
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LoanProvider>
          <AuthProvider>


            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>

                <Routes>
                  <Route path="/" element={<MainLayout />}>

                    <Route
                      path="/"
                      element={
                        <Index />
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard bankData={user?.bank} />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/loan-detail/:id"
                      element={
                        <ProtectedRoute>
                          <UserLoanDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/api/applicant"></Route>

                    {/* Bank Mandate Routes */}

                    <Route
                      path="/bank-mandates"
                      element={
                        <ProtectedRoute>
                          <BankMandate />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/bank-mandates/:mandateId"
                      element={
                        <ProtectedRoute>
                          <MandateDetails />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="*" element={<NotFound />} />
                  </Route>


                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LoanProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
