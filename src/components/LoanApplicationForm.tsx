
import { useState } from "react";
import { useLoan } from "@/contexts/LoanContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

export function LoanApplicationForm() {
  const { user } = useAuth();
  const { submitApplication } = useLoan();
  
  const [activeTab, setActiveTab] = useState("bank-details");
  
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  
  const [loanAmount, setLoanAmount] = useState("");
  
  const [fullName, setFullName] = useState("");
  const [panCardNumber, setPanCardNumber] = useState("");
  const [phone, setPhone] = useState("");

  const handleNextTab = () => {
    if (activeTab === "bank-details") {
      if (!bankName || !accountNumber || !ifscCode) {
        toast({
          title: "Missing Information",
          description: "Please fill in all bank details",
          variant: "destructive",
        });
        return;
      }
      setActiveTab("loan-amount");
    } else if (activeTab === "loan-amount") {
      if (!loanAmount || parseFloat(loanAmount) <= 0) {
        toast({
          title: "Invalid Loan Amount",
          description: "Please enter a valid loan amount",
          variant: "destructive",
        });
        return;
      }
      setActiveTab("user-details");
    }
  };

  const handlePreviousTab = () => {
    if (activeTab === "loan-amount") {
      setActiveTab("bank-details");
    } else if (activeTab === "user-details") {
      setActiveTab("loan-amount");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate user details before submission
    if (!fullName || !panCardNumber || !phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all user details",
        variant: "destructive",
      });
      return;
    }
    
    // Pan card validation (basic format)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panCardNumber)) {
      toast({
        title: "Invalid PAN Card",
        description: "Please enter a valid PAN card number (e.g., ABCDE1234F)",
        variant: "destructive",
      });
      return;
    }
    
    // Phone validation (basic format - 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    // Submit the application
    submitApplication({
      bankDetails: {
        bankName,
        accountNumber,
        ifscCode,
      },
      loanAmount: parseFloat(loanAmount),
      userDetails: {
        fullName,
        panCardNumber,
        email: user?.email || "",
        phone,
      },
    });

    // Reset the form
    setBankName("");
    setAccountNumber("");
    setIfscCode("");
    setLoanAmount("");
    setFullName("");
    setPanCardNumber("");
    setPhone("");
    
    // Go back to first tab
    setActiveTab("bank-details");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for a Loan</CardTitle>
        <CardDescription>Fill out the form below to apply for a loan</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
            <TabsTrigger value="loan-amount">Loan Amount</TabsTrigger>
            <TabsTrigger value="user-details">User Details</TabsTrigger>
          </TabsList>
          
          {/* Bank Details Tab */}
          <TabsContent value="bank-details" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input 
                id="bank-name" 
                placeholder="Enter your bank name" 
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input 
                id="account-number" 
                placeholder="Enter your account number" 
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifsc-code">IFSC Code</Label>
              <Input 
                id="ifsc-code" 
                placeholder="Enter IFSC code" 
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleNextTab}>Next</Button>
            </div>
          </TabsContent>
          
          {/* Loan Amount Tab */}
          <TabsContent value="loan-amount" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loan-amount">Loan Amount (₹)</Label>
              <Input 
                id="loan-amount" 
                type="number" 
                placeholder="Enter loan amount" 
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                min="1000"
              />
              <p className="text-sm text-muted-foreground">
                Enter the amount you wish to borrow
              </p>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePreviousTab}>Previous</Button>
              <Button onClick={handleNextTab}>Next</Button>
            </div>
          </TabsContent>
          
          {/* User Details Tab */}
          <TabsContent value="user-details" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input 
                id="full-name" 
                placeholder="Enter your full name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan-card">PAN Card Number</Label>
              <Input 
                id="pan-card" 
                placeholder="Enter PAN card number" 
                value={panCardNumber}
                onChange={(e) => setPanCardNumber(e.target.value.toUpperCase())}
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="Enter phone number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePreviousTab}>Previous</Button>
              <Button onClick={handleSubmit}>Submit Application</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
