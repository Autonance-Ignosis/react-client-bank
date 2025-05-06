import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

export function UserLoanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //   console.log("User ID from URL:", userid);
  console.log("Loan ID from URL:", id);

  useEffect(() => {
    const fetchUserAndLoanDetails = async () => {
      if (!id) {
        setError("No loan ID provided");
        setLoading(false);
        return;
      }
      //   if (!userid) {
      //     setError("No user ID provided");
      //     setLoading(false);
      //     return;
      //   }

      setLoading(true);
      setError(null);

      try {
        const loanResponse = await fetch(
          `http://localhost:8080/api/loans/${id}`
        );
        if (!loanResponse.ok) {
          throw new Error(`Failed to fetch loan: ${loanResponse.status}`);
        }
        const loanData = await loanResponse.json();

        const userid = loanData.userId; // Use the userId from loanData if available
        // Fetch user details
        const userResponse = await fetch(
          `http://localhost:8080/api/user/${userid}`
        );
        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user: ${userResponse.status}`);
        }
        const userData = await userResponse.json();
        console.log("User Data:", userData);

        // Fetch loan details for this user

        setUser(userData);
        setLoan(loanData);
      } catch (err) {
        console.error("Error fetching details:", err);
        setError(err.message || "Failed to load user and loan details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndLoanDetails();
  }, [id]);

  // Format date to be more readable
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Format currency amounts
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "N/A";
    try {
      return `₹${Number(amount).toLocaleString()}`;
    } catch (e) {
      return "Invalid Amount";
    }
  };

  // Helper to get status badge
  const getStatusBadge = (status) => {
    if (!status) return null;

    const statusProps = {
      APPROVED: {
        variant: "success",
        icon: <Check className="w-4 h-4 mr-1" />,
      },
      REJECTED: {
        variant: "destructive",
        icon: <X className="w-4 h-4 mr-1" />,
      },
      PENDING: { variant: "warning", icon: <Clock className="w-4 h-4 mr-1" /> },
    };

    const { variant, icon } = statusProps[status] || {
      variant: "secondary",
      icon: null,
    };

    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        {status}
      </Badge>
    );
  };

  // Helper to get KYC status badge
  const getKycBadge = (status) => {
    if (!status) return null;

    const statusProps = {
      APPROVED: {
        variant: "success",
        icon: <ShieldCheck className="w-4 h-4 mr-1" />,
      },
      REJECTED: {
        variant: "destructive",
        icon: <X className="w-4 h-4 mr-1" />,
      },
      PENDING: { variant: "warning", icon: <Clock className="w-4 h-4 mr-1" /> },
    };

    const { variant, icon } = statusProps[status] || {
      variant: "secondary",
      icon: null,
    };

    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        {status}
      </Badge>
    );
  };

  // Get purpose label and icon
  const getPurposeInfo = (purpose) => {
    if (!purpose)
      return { label: "Other", icon: <FileText className="w-5 h-5" /> };

    const purposeMap = {
      home: { label: "Home Loan", icon: <Home className="w-5 h-5" /> },
      car: { label: "Car Loan", icon: <CreditCard className="w-5 h-5" /> },
      education: {
        label: "Education Loan",
        icon: <FileText className="w-5 h-5" />,
      },
      business: {
        label: "Business Loan",
        icon: <DollarSign className="w-5 h-5" />,
      },
      personal: { label: "Personal Loan", icon: <User className="w-5 h-5" /> },
    };

    return (
      purposeMap[purpose.toLowerCase()] || {
        label: purpose,
        icon: <FileText className="w-5 h-5" />,
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="w-5 h-5 mr-2" />
            Error Loading Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!user || !loan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User or Loan Not Found</CardTitle>
          <CardDescription>
            We couldn't find the requested information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            The user or loan details you're looking for don't exist or may have
            been removed.
          </p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Use the purpose info
  const { label: purposeLabel, icon: purposeIcon } = getPurposeInfo(
    loan.purpose
  );
  console.log("loan detail" + loan);
  console.log(loan);

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="mr-4">
          Back
        </Button>
        <h1 className="text-3xl font-bold">User & Loan Details</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>User Information</span>
              {user.flaggedAsRisk && (
                <Badge variant="destructive" className="ml-2">
                  Risk Flagged
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Personal details of the loan applicant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.fullName}
                  className="w-20 h-20 rounded-full mr-4 object-cover border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full mr-4 bg-muted flex items-center justify-center">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-medium">{user.fullName}</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                {/* <p className="text-sm font-medium mb-1">User ID</p> */}
                {/* <p>{user.id}</p> */}
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Role</p>
                <p className="capitalize">
                  {user.role?.toLowerCase() || "User"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">KYC Status</p>
                {getKycBadge(user.kycStatus)}
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Account Created</p>
                <p className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {purposeIcon}
              <span className="ml-2">{purposeLabel}</span>
              <div className="ml-auto">{getStatusBadge(loan.status)}</div>
            </CardTitle>
            <CardDescription>Loan application details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium mb-1">Loan ID</p>
                <p>{loan.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Bank ID</p>
                {/* <p>{loan.bankId || "N/A"}</p> */}
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Applied Date</p>
                <p className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                  {formatDate(loan.appliedAt)}
                </p>
              </div>
              {loan.status === "APPROVED" && loan.approvedAt && (
                <div>
                  <p className="text-sm font-medium mb-1">Approved Date</p>
                  <p className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                    {formatDate(loan.approvedAt)}
                  </p>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Loan Amount</p>
                <p className="text-xl font-bold">
                  {formatCurrency(loan.amount)}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Interest Rate</p>
                <p className="font-semibold">{loan.interestRate || "N/A"}%</p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Tenure</p>
                <p className="font-semibold">
                  {loan.tenureInMonths || "N/A"} months
                </p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Monthly EMI</p>
                <p className="font-bold">{formatCurrency(loan.emi)}</p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Total Repayment</p>
                <p className="font-semibold">
                  {formatCurrency(loan.emi * loan.tenureInMonths)}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full">
              {loan.status === "PENDING" && (
                <div className="flex gap-2 justify-end">
                  <Button variant="destructive">Reject</Button>
                  <Button variant="default">Approve</Button>
                </div>
              )}
              {loan.status === "APPROVED" && (
                <p className="text-green-600 text-center font-medium">
                  This loan application has been approved
                </p>
              )}
              {loan.status === "REJECTED" && (
                <p className="text-red-600 text-center font-medium">
                  This loan application has been rejected
                </p>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
