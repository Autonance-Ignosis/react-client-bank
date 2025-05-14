import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Building, Calendar, Clock, CheckCircle, XCircle, AlertCircle,
    Loader2, X, Check, Info, User, DollarSign, ArrowLeft,
    CreditCard, FileText, Landmark, Banknote, Percent, ShieldCheck
} from 'lucide-react';
import { useSelector } from "react-redux";

// Import components from your UI library
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const STATUS_COLORS = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    EXPIRED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    REVOKED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    DEFAULT: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const STATUS_VARIANTS = {
    ACTIVE: "success",
    EXPIRED: "destructive",
    PENDING: "warning",
    REVOKED: "secondary",
    DEFAULT: "default",
};

const STATUS_ICONS = {
    ACTIVE: CheckCircle,
    EXPIRED: XCircle,
    PENDING: AlertCircle,
    REVOKED: XCircle,
    DEFAULT: AlertCircle,
};

export default function MandateDetails() {
    const { mandateId } = useParams();
    const navigate = useNavigate();

    const [mandate, setMandate] = useState(null);
    const [loan, setLoan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingAction, setProcessingAction] = useState(false);
    const [actionError, setActionError] = useState(null);

    const user = useSelector((state: any) => state?.user?.user || {});
    const userId = user?.id;
    const bank = user?.bank || null;

    useEffect(() => {
        const fetchDetails = async () => {
            if (!userId || !mandateId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Fetch specific mandate details
                const mandateResponse = await fetch(
                    `http://localhost:8080/api/mandates/${mandateId}`
                );

                if (!mandateResponse.ok) {
                    const errorText = await mandateResponse.text();
                    throw new Error(
                        `Failed to fetch mandate details (${mandateResponse.status}): ${errorText || "Unknown error"}`
                    );
                }

                const mandateData = await mandateResponse.json();

                // Fetch user details
                const userResponse = await fetch(
                    `http://localhost:8080/api/user/${mandateData.userId}`
                );

                if (!userResponse.ok) {
                    const errorText = await userResponse.text();
                    throw new Error(
                        `Failed to fetch user details (${userResponse.status}): ${errorText || "Unknown error"}`
                    );
                }

                const userDetails = await userResponse.json();

                // Fetch loan details if loanId exists
                let loanData = null;
                if (mandateData.loanId) {
                    const loanResponse = await fetch(
                        `http://localhost:8080/api/loans/${mandateData.loanId}`
                    );

                    if (loanResponse.ok) {
                        loanData = await loanResponse.json();
                    } else {
                        console.warn(`Failed to fetch loan details for ID ${mandateData.loanId}`);
                    }
                }

                // Add bank name and user details information
                const mandateWithDetails = {
                    ...mandateData,
                    bankName: bank?.name || "Unknown Bank",
                    bankId: bank?.id,
                    userDetails,
                };

                setMandate(mandateWithDetails);
                setLoan(loanData);
            } catch (err) {
                console.error("Error fetching details:", err);
                setError(err.message || "Failed to load mandate details");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [mandateId, userId, bank]);

    const handleAcceptMandate = async () => {
        setProcessingAction(true);
        setActionError(null);

        try {
            // Call the approve endpoint
            const response = await fetch(
                `http://localhost:8080/api/mandates/${mandateId}/approve`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Failed to approve mandate (${response.status}): ${errorText || "Unknown error"}`
                );
            }

            // Update local state after successful approval
            setMandate((prev) => ({ ...prev, status: "ACTIVE" }));
        } catch (error) {
            console.error("Error accepting mandate:", error);
            setActionError(
                error.message || "Failed to approve mandate. Please try again."
            );
        } finally {
            setProcessingAction(false);
        }
    };

    const handleRejectMandate = async () => {
        setProcessingAction(true);
        setActionError(null);

        try {
            // Call the reject endpoint
            const response = await fetch(
                `http://localhost:8080/api/mandates/${mandateId}/reject`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Failed to reject mandate (${response.status}): ${errorText || "Unknown error"}`
                );
            }

            // Update local state after successful rejection
            setMandate((prev) => ({ ...prev, status: "REVOKED" }));
        } catch (error) {
            console.error("Error rejecting mandate:", error);
            setActionError(
                error.message || "Failed to reject mandate. Please try again."
            );
        } finally {
            setProcessingAction(false);
        }
    };

    const goBack = () => {
        navigate("/bank-mandates");
    };

    const formatDate = (dateString) => {
        try {
            if (!dateString) return "Not available";

            // Handle timestamp in milliseconds (numeric value)
            if (typeof dateString === "number") {
                return new Date(dateString).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });
            }

            // Handle string date format
            return new Date(dateString).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "Invalid date";
        }
    };

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return "Not specified";
        return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
    };

    const getStatusIcon = (status) => {
        const IconComponent = STATUS_ICONS[status] || STATUS_ICONS.DEFAULT;
        return <IconComponent className="h-4 w-4" />;
    };

    // Info card component for displaying detailed information
    const InfoCard = ({ title, items }) => (
        <div className="space-y-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 pb-2">
                {title}
            </h4>
            <Separator />
            <div className="space-y-4 mt-3">
                {items.map((item, index) => (
                    <div key={index} className="flex items-start">
                        {item.icon && <item.icon className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />}
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {item.label}
                            </p>
                            <p className="text-gray-800 dark:text-gray-200">
                                {item.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const mandateInfoItems = mandate ? [
        { icon: FileText, label: "Mandate ID", value: mandate.id || "N/A" },
        { icon: Building, label: "Bank", value: mandate.bankName || "Banking Account" },
        { icon: DollarSign, label: "Amount", value: formatCurrency(mandate.amount) },
        { icon: Info, label: "Category", value: mandate.category || "N/A" },
        { icon: Calendar, label: "Created", value: formatDate(mandate.createdAt) },
        { icon: Calendar, label: "Last Updated", value: formatDate(mandate.updatedAt) },
    ] : [];

    const mandateDetailsItems = mandate ? [
        { icon: Info, label: "Variant", value: mandate.mandateVariant || "N/A" },
        { icon: Info, label: "Debit Type", value: mandate.debitType || "N/A" },
        { icon: Info, label: "Frequency", value: mandate.freqType || "N/A" },
        { icon: Info, label: "Sequence Type", value: mandate.seqType || "N/A" },
        { icon: Info, label: "Schema Name", value: mandate.schemaName || "N/A" },
        { icon: Calendar, label: "Valid From", value: formatDate(mandate.startDate) },
        { icon: Calendar, label: "Valid To", value: formatDate(mandate.uptoDate) },
    ] : [];

    const loanInfoItems = loan ? [
        { icon: FileText, label: "Loan ID", value: loan.id || "N/A" },
        { icon: FileText, label: "Loan Type", value: loan.purpose || "N/A" },
        { icon: Banknote, label: "Principal Amount", value: formatCurrency(loan.amount) },
        { icon: Percent, label: "Interest Rate", value: loan.interestRate ? `${loan.interestRate}%` : "N/A" },
        { icon: Calendar, label: "Applied At", value: formatDate(loan.appliedAt) },
        { icon: Calendar, label: "Next EMI Date", value: formatDate(loan.nextEmiDate) },
        { icon: Info, label: "Credit Criteria Met", value: loan.creditCriteriaMet ? "Yes" : "No" },
        { icon: Info, label: "FICO Score", value: loan.ficoScore || "N/A" },
        { icon: Info, label: "Default Risk Probability", value: loan.defaultRiskProbability ? `${(loan.defaultRiskProbability * 100).toFixed(2)}%` : "N/A" },
    ] : [];

    const loanPaymentItems = loan ? [
        { icon: Banknote, label: "EMI Amount", value: formatCurrency(loan.emi) },
        { icon: Info, label: "Tenure", value: loan.tenureInMonths ? `${loan.tenureInMonths} months` : "N/A" },
        { icon: Info, label: "Debt-to-Income Ratio", value: loan.debtIncomeRatio ? `${(loan.debtIncomeRatio * 100).toFixed(2)}%` : "N/A" },
        { icon: Info, label: "Revolving Balance", value: formatCurrency(loan.revolvingBalance) },
        { icon: Info, label: "Revolving Utilization", value: loan.revolvingUtilization ? `${(loan.revolvingUtilization * 100).toFixed(2)}%` : "N/A" },
        { icon: Info, label: "Days with Credit Line", value: loan.daysWithCreditLine || "N/A" },
        { icon: Info, label: "Times Late in 2 Years", value: loan.timesLateIn2Years || "N/A" },
        { icon: Info, label: "Derogatory Public Records", value: loan.derogatoryPublicRecords || "N/A" },
        { icon: Landmark, label: "Lender", value: loan.lenderName || mandate?.bankName || "N/A" },
    ] : [];

    const renderLoadingState = () => (
        <div className="flex justify-center items-center py-10">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Loading details...
                </p>
            </div>
        </div>
    );

    const renderError = () => (
        <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading details</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <div className="mt-4 flex space-x-2">
                <Button variant="outline" onClick={goBack}>Go Back</Button>
                <Button variant="destructive" onClick={() => window.location.reload()}>Try again</Button>
            </div>
        </Alert>
    );

    const renderNotFound = () => (
        <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Mandate not found</AlertTitle>
            <AlertDescription>
                The mandate you're looking for doesn't exist or you don't have permission to view it.
            </AlertDescription>
            <div className="mt-4">
                <Button variant="outline" onClick={goBack}>Go Back</Button>
            </div>
        </Alert>
    );

    return (
        <main className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={goBack}
                    className="mr-4"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Mandate Details
                </h1>
            </div>

            {loading && renderLoadingState()}
            {error && !loading && renderError()}
            {!loading && !error && !mandate && renderNotFound()}

            {!loading && !error && mandate && (
                <div className="space-y-6">
                    {/* Mandate Card */}
                    <Card>
                        <CardHeader className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <Building className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                                    <CardTitle>{mandate.bankName || "Unknown Bank"}</CardTitle>
                                </div>
                                <Badge variant={STATUS_VARIANTS[mandate.status] || STATUS_VARIANTS.DEFAULT}>
                                    <div className="flex items-center space-x-1">
                                        {getStatusIcon(mandate.status)}
                                        <span>{mandate.status || "UNKNOWN"}</span>
                                    </div>
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                            {actionError && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{actionError}</AlertDescription>
                                </Alert>
                            )}

                            {/* Customer Information Banner */}
                            <Card className="mb-6 bg-gray-50 dark:bg-gray-800/50">
                                <CardContent className="pt-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                                        <div className="flex items-center mb-3 md:mb-0">
                                            <User className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                                            <div>
                                                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                                    {mandate.userDetails?.name || "Customer"}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {mandate.userDetails?.email || "No email provided"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Customer ID
                                                </div>
                                                <div className="text-gray-800 dark:text-gray-200">
                                                    {mandate.userDetails?.id || mandate.userId || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                {/* Basic Information */}
                                <InfoCard title="Basic Information" items={mandateInfoItems} />

                                {/* Mandate Details */}
                                <InfoCard title="Mandate Details" items={mandateDetailsItems} />
                            </div>

                            {/* Prediction Results */}
                            <div className="flex justify-between items-center mt-6">
                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Prediction Results</p>
                                    <div className="flex items-center">
                                        <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {mandate.predictionStatus || "No prediction available"}
                                        </span>
                                        {mandate.predictionResult === "REJECT" && (
                                            <AlertCircle className="h-5 w-5 text-red-500 ml-2" />
                                        )}
                                        {mandate.predictionProbability && (
                                            <Badge variant="outline" className={`ml-2 ${STATUS_COLORS[mandate.predictionResult] || STATUS_COLORS.DEFAULT}`}>
                                                {mandate.predictionProbability}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3">
                                    {mandate.status === "PENDING" && (
                                        <>
                                            <Button
                                                onClick={handleAcceptMandate}
                                                disabled={processingAction}
                                                variant="default"
                                            >
                                                {processingAction ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <Check className="h-4 w-4 mr-2" />
                                                )}
                                                Accept Mandate
                                            </Button>
                                            <Button
                                                onClick={handleRejectMandate}
                                                disabled={processingAction}
                                                variant="destructive"
                                            >
                                                {processingAction ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <X className="h-4 w-4 mr-2" />
                                                )}
                                                Reject Mandate
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="outline" onClick={goBack}>
                                        Go Back
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Loan Details Card */}
                    {loan ? (
                        <Card>
                            <CardHeader className="bg-green-50 dark:bg-green-900/30 border-b border-green-100 dark:border-green-800">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                                        <CardTitle>Linked Loan Details</CardTitle>
                                    </div>
                                    <Badge variant={STATUS_VARIANTS[loan.status] || STATUS_VARIANTS.DEFAULT}>
                                        {loan.status || "UNKNOWN"}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Loan Basic Info */}
                                    <InfoCard title="Loan Information" items={loanInfoItems} />

                                    {/* Loan Payment Details */}
                                    <InfoCard title="Payment Information" items={loanPaymentItems} />
                                </div>
                            </CardContent>
                        </Card>
                    ) : mandate.loanId ? (
                        <Card>
                            <CardHeader className="bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-100 dark:border-yellow-800">
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                                    <CardTitle>Linked Loan Information</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="py-8 text-center">
                                <p className="text-gray-600 dark:text-gray-400">
                                    This mandate is linked to loan ID: <span className="font-medium">{mandate.loanId}</span>, but the loan details could not be retrieved.
                                </p>
                            </CardContent>
                        </Card>
                    ) : null}
                </div>
            )}
        </main>
    );
}