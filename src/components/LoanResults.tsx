
import { useLoan } from "@/contexts/LoanContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, ShieldCheck, ShieldX, AlertCircle } from "lucide-react";
import { useState } from "react";

export function LoanResults() {
  const { currentApplication, resetCurrentApplication, calculateCibilScore, approveLoan, rejectLoan } = useLoan();
  const [processing, setProcessing] = useState(false);

  if (!currentApplication) {
    return null;
  }

  // Handler for calculating CIBIL score
  const handleCalculateCibil = () => {
    setProcessing(true);
    setTimeout(() => {
      calculateCibilScore(currentApplication.id);
      setProcessing(false);
    }, 1500); // Simulate processing time
  };

  // Handler for approving loan
  const handleApproveLoan = () => {
    approveLoan(currentApplication.id);
  };

  // Handler for rejecting loan
  const handleRejectLoan = () => {
    rejectLoan(currentApplication.id);
  };

  // Format CIBIL score between 0-100 for the progress bar
  const cibilProgressValue = 
    currentApplication.cibilScore ? 
    ((currentApplication.cibilScore - 300) / 600) * 100 : 0;

  // Determine risk class for styling
  const getRiskClass = () => {
    switch(currentApplication.riskAssessment) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-amber-600";
      case "high":
        return "text-red-600";
      default:
        return "";
    }
  };
  
  // Progress bar color based on approval
  const getProgressColor = () => {
    if (!currentApplication.cibilScore) return "bg-gray-300";
    if (currentApplication.cibilScore >= 750) return "bg-green-500";
    if (currentApplication.cibilScore >= 650) return "bg-amber-500";
    return "bg-red-500";
  };

  // Is loan eligible for approval (CIBIL >= 650 which is 60% of range 300-900)
  const isEligibleForApproval = currentApplication.cibilScore 
    ? currentApplication.cibilScore >= 650 
    : false;

  // Check if CIBIL score has been calculated
  const isCibilCalculated = currentApplication.cibilScore !== undefined;

  // Check if loan has been assessed
  const isLoanAssessed = currentApplication.approved !== undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Application Review</CardTitle>
        <CardDescription>
          Application ID: {currentApplication.id}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Application Summary */}
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold mb-2">Application Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Applicant</div>
            <div>{currentApplication.userDetails.fullName}</div>
            
            <div className="font-medium">Loan Amount</div>
            <div>₹{currentApplication.loanAmount.toLocaleString()}</div>
            
            <div className="font-medium">Bank</div>
            <div>{currentApplication.bankDetails.bankName}</div>

            <div className="font-medium">PAN Number</div>
            <div>{currentApplication.userDetails.panCardNumber}</div>

            <div className="font-medium">Account Number</div>
            <div>{currentApplication.bankDetails.accountNumber}</div>
          </div>
        </div>
        
        {/* CIBIL Score Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">CIBIL Score</h3>
            {isCibilCalculated ? (
              <span className="font-bold text-xl">
                {currentApplication.cibilScore}
              </span>
            ) : (
              <Button 
                onClick={handleCalculateCibil} 
                disabled={processing}
                size="sm"
              >
                {processing ? "Processing..." : "Calculate CIBIL Score"}
              </Button>
            )}
          </div>
          
          {isCibilCalculated && (
            <>
              <Progress value={cibilProgressValue} className={getProgressColor()} />
              <p className="text-sm text-muted-foreground">
                {currentApplication.cibilScore && currentApplication.cibilScore >= 750 ? (
                  "Excellent credit score. Qualifies for the best rates."
                ) : currentApplication.cibilScore && currentApplication.cibilScore >= 650 ? (
                  "Good credit score. Qualifies for standard rates."
                ) : (
                  "Poor credit score. Does not qualify for loan approval."
                )}
              </p>
            </>
          )}
        </div>
        
        {/* Risk Assessment */}
        {isCibilCalculated && (
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Risk Assessment</h3>
            <div className="flex items-center gap-2 mb-2">
              {currentApplication.riskAssessment === "low" ? (
                <ShieldCheck className="text-green-600 h-5 w-5" />
              ) : currentApplication.riskAssessment === "medium" ? (
                <Shield className="text-amber-600 h-5 w-5" />
              ) : (
                <ShieldX className="text-red-600 h-5 w-5" />
              )}
              <span className={`text-lg font-medium ${getRiskClass()}`}>
                {currentApplication.riskAssessment?.toUpperCase()} RISK
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentApplication.riskAssessment === "low" ? (
                "The loan poses minimal risk to the bank based on the applicant's credit profile."
              ) : currentApplication.riskAssessment === "medium" ? (
                "The loan poses moderate risk to the bank. Additional documentation may be required."
              ) : (
                "The loan poses high risk to the bank. Application should be carefully reviewed."
              )}
            </p>
          </div>
        )}
        
        {/* Approval Decision */}
        {isCibilCalculated && !isLoanAssessed && (
          <Alert className={isEligibleForApproval ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertCircle className={isEligibleForApproval ? "text-green-600" : "text-red-600"} />
            <AlertTitle>{isEligibleForApproval ? "Eligible for Approval" : "Not Eligible"}</AlertTitle>
            <AlertDescription>
              {isEligibleForApproval 
                ? "This application meets the minimum requirements for loan approval." 
                : "This application does not meet the minimum requirements for loan approval."}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Approval Status */}
        {isLoanAssessed && (
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Loan Status</h3>
            <div className="flex items-center gap-2">
              <div 
                className={`h-3 w-3 rounded-full ${
                  currentApplication.approved ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-lg font-medium">
                {currentApplication.approved ? "Approved" : "Rejected"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {currentApplication.approved ? (
                "Based on the CIBIL score and risk assessment, this loan has been approved."
              ) : (
                "Based on the CIBIL score and risk assessment, this loan has been rejected."
              )}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col space-y-2">
        {isCibilCalculated && !isLoanAssessed && (
          <div className="flex w-full gap-2">
            <Button
              onClick={handleRejectLoan}
              variant="destructive"
              className="w-full"
            >
              Reject Loan
            </Button>
            <Button
              onClick={handleApproveLoan}
              className="w-full"
              disabled={!isEligibleForApproval}
            >
              Approve Loan
            </Button>
          </div>
        )}
        <Button onClick={resetCurrentApplication} variant="outline" className="w-full">
          Back to Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
}
