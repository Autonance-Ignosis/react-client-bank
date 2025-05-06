import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function NotificationPanel({ bankId }) {
  const navigate = useNavigate();
  const [bankLoans, setBankLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBankLoans = async () => {
      if (!bankId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8080/api/loans/bank/${bankId}`
        );

        if (response.ok) {
          const data = await response.json();
          setBankLoans(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch bank loans");
          setBankLoans([]);
        }
      } catch (error) {
        console.error("Error fetching bank loans:", error);
        setBankLoans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBankLoans();
  }, [bankId]);

  // Format date to be more readable
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";

    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Safe number formatting
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return "N/A";
    try {
      return Number(amount).toLocaleString();
    } catch (e) {
      return "Invalid Amount";
    }
  };

  // Format EMI amount
  const formatEmi = (emi) => {
    if (emi === null || emi === undefined) return "N/A";
    try {
      return Math.round(Number(emi)).toLocaleString();
    } catch (e) {
      return "Invalid EMI";
    }
  };

  // Get purpose label
  const getPurposeLabel = (purpose) => {
    if (!purpose) return "Other";

    const purposeMap = {
      home: "Home Loan",
      car: "Car Loan",
      education: "Education Loan",
      business: "Business Loan",
      personal: "Personal Loan",
    };

    return purposeMap[purpose.toLowerCase()] || purpose;
  };

  // Navigate to user detail page
  const handleViewApplication = (loanid) => {
    if (!loanid) return;
    navigate(`/api/userdetail/${loanid}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Loan Applications</span>
          <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded-full">
            {bankLoans?.length || 0}
          </span>
        </CardTitle>
        <CardDescription>
          {loading
            ? "Loading loan applications..."
            : !bankLoans || bankLoans.length === 0
            ? "No loan applications found"
            : `You have ${bankLoans.length} loan ${
                bankLoans.length === 1 ? "application" : "applications"
              }`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Loading applications...</p>
            </div>
          ) : !bankLoans || bankLoans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No loan applications found</p>
              <p className="text-sm">New applications will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bankLoans.map((loan) => {
                if (!loan) return null;

                return (
                  <div
                    key={loan.id || `loan-${Math.random()}`}
                    className="border rounded-md p-4 hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">
                        User ID: {loan.userId || "N/A"}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        Applied: {formatDate(loan.appliedAt)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
                      <p className="text-sm">
                        <span className="font-medium">Amount:</span> ₹
                        {formatAmount(loan.amount)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">EMI:</span> ₹
                        {formatEmi(loan.emi)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Tenure:</span>{" "}
                        {loan.tenureInMonths || "N/A"} months
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Interest:</span>{" "}
                        {loan.interestRate || "N/A"}%
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Purpose:</span>{" "}
                        {getPurposeLabel(loan.purpose)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span>{" "}
                        <span
                          className={`font-medium ${
                            loan.status === "APPROVED"
                              ? "text-green-600"
                              : loan.status === "REJECTED"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {loan.status || "PENDING"}
                        </span>
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleViewApplication(loan.id)
                        }
                        disabled={!loan.userId}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
