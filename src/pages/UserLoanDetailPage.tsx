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
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Car,
  AlertTriangle
} from "lucide-react";

export function UserLoanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const acceptLoan = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/loans/${id}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to approve loan");
      }
      const data = await response.json();
      console.log("Loan approved:", data);
      navigate(-1);
    } catch (error) {
      console.error("Error approving loan:", error);
    }
  };

  const rejectLoan = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/loans/${id}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to reject loan");
      }
      const data = await response.json();
      console.log("Loan rejected:", data);
      navigate(-1);
    } catch (error) {
      console.error("Error rejecting loan:", error);
    }
  };

  useEffect(() => {
    const fetchUserAndLoanDetails = async () => {
      if (!id) {
        setError("No loan ID provided");
        setLoading(false);
        return;
      }

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

        const userid = loanData.userId;
        const userResponse = await fetch(
          `http://localhost:8080/api/user/${userid}`
        );
        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user: ${userResponse.status}`);
        }
        const userData = await userResponse.json();

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
        className: "bg-green-100 text-green-800 border-green-200"
      },
      REJECTED: {
        variant: "destructive",
        icon: <X className="w-4 h-4 mr-1" />,
        className: "bg-red-100 text-red-800 border-red-200"
      },
      PENDING: {
        variant: "warning",
        icon: <Clock className="w-4 h-4 mr-1" />,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200"
      },
    };

    const { variant, icon, className } = statusProps[status] || {
      variant: "secondary",
      icon: null,
      className: ""
    };

    return (
      <Badge variant={variant} className={`flex items-center px-3 py-1 rounded-full font-medium ${className}`}>
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
        className: "bg-green-100 text-green-800 border-green-200"
      },
      REJECTED: {
        variant: "destructive",
        icon: <X className="w-4 h-4 mr-1" />,
        className: "bg-red-100 text-red-800 border-red-200"
      },
      PENDING: {
        variant: "warning",
        icon: <Clock className="w-4 h-4 mr-1" />,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200"
      },
    };

    const { variant, icon, className } = statusProps[status] || {
      variant: "secondary",
      icon: null,
      className: ""
    };

    return (
      <Badge variant={variant} className={`flex items-center px-3 py-1 rounded-full font-medium ${className}`}>
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
      car: { label: "Car Loan", icon: <Car className="w-5 h-5" /> },
      education: {
        label: "Education Loan",
        icon: <GraduationCap className="w-5 h-5" />,
      },
      business: {
        label: "Business Loan",
        icon: <Briefcase className="w-5 h-5" />,
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card className="border-red-300 shadow-lg">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center text-red-700">
              <AlertCircle className="w-5 h-5 mr-2" />
              Error Loading Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-6">{error}</p>
            <Button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !loan) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>User or Loan Not Found</CardTitle>
            <CardDescription>
              We couldn't find the requested information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              The user or loan details you're looking for don't exist or may have
              been removed.
            </p>
            <Button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use the purpose info
  const { label: purposeLabel, icon: purposeIcon } = getPurposeInfo(
    loan.purpose
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center mb-8">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mr-4 border-gray-300"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Loan Application Details</h1>
        <div className="ml-auto">
          {loan && getStatusBadge(loan.status)}
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* User Information Card */}
        <Card className="md:col-span-5 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Applicant Information</CardTitle>
              {user.flaggedAsRisk && (
                <Badge variant="destructive" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Risk Flagged
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">{user.fullName}</h3>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Account Type</p>
                  <p className="font-medium capitalize text-gray-900 dark:text-gray-100">{user.role?.toLowerCase() || "User"}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">KYC Status</p>
                  {getKycBadge(user.kycStatus)}
                </div>

                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Account Created</p>
                  <p className="flex items-center text-gray-900 dark:text-gray-100">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Details Card */}
        <Card className="md:col-span-7 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                {purposeIcon}
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{purposeLabel}</CardTitle>
                <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">Applied on {formatDate(loan.appliedAt)}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              {/* Loan Amount and Interest Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Loan Amount</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(loan.amount)}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Interest Rate</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{loan.interestRate || "N/A"}%</p>
                </div>
              </div>

              {/* Loan Details Grid */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-3 text-gray-700 dark:text-gray-200">Repayment Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tenure</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{loan.tenureInMonths || "N/A"} months</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly EMI</p>
                    <p className="font-medium text-blue-700 dark:text-blue-300">{formatCurrency(loan.emi)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Repayment</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(loan.emi * loan.tenureInMonths)}</p>
                  </div>
                </div>
              </div>

              {loan.status === "APPROVED" && loan.approvedAt && (
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <div className="flex items-center text-green-800 dark:text-green-200">
                    <Check className="w-5 h-5 mr-2" />
                    <p className="font-medium">Approved on {formatDate(loan.approvedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
            <div className="w-full">
              {loan.status === "PENDING" && (
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={rejectLoan}
                    className="border-red-300 text-red-700 dark:border-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-800 dark:hover:text-red-200"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    onClick={acceptLoan}
                    className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
              {loan.status === "APPROVED" && (
                <p className="text-green-600 dark:text-green-300 text-center font-medium flex items-center justify-center">
                  <Check className="w-5 h-5 mr-2" />
                  This loan application has been approved
                </p>
              )}
              {loan.status === "REJECTED" && (
                <p className="text-red-600 dark:text-red-300 text-center font-medium flex items-center justify-center">
                  <X className="w-5 h-5 mr-2" />
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