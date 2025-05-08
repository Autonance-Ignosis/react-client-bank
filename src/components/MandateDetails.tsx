import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Building, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Loader2, X, Check, Info, User, DollarSign, ArrowLeft, CreditCard, FileText, Landmark, Banknote, Percent, ShieldCheck } from 'lucide-react';
import { useSelector } from "react-redux";

const STATUS_COLORS = {
    ACTIVE: "text-green-500",
    EXPIRED: "text-red-500",
    PENDING: "text-yellow-500",
    REVOKED: "text-gray-500",
    DEFAULT: "text-blue-500",
};

const STATUS_ICONS = {
    ACTIVE: CheckCircle,
    EXPIRED: XCircle,
    PENDING: AlertCircle,
    REVOKED: XCircle,
    DEFAULT: AlertCircle,
};

const LOAN_STATUS_COLORS = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    DEFAULTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    DEFAULT: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
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

            setProcessingAction(false);
        } catch (error) {
            console.error("Error accepting mandate:", error);
            setActionError(
                error.message || "Failed to approve mandate. Please try again."
            );
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

            setProcessingAction(false);
        } catch (error) {
            console.error("Error rejecting mandate:", error);
            setActionError(
                error.message || "Failed to reject mandate. Please try again."
            );
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
        const colorClass = STATUS_COLORS[status] || STATUS_COLORS.DEFAULT;
        return <IconComponent className={`${colorClass} h-4 w-4 mr-1`} />;
    };

    return (
        <main className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center mb-6">
                <button
                    onClick={goBack}
                    className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Mandate Details
                </h1>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-10">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Loading details...
                        </p>
                    </div>
                </div>
            )}

            {error && !loading && (
                <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-2">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                        <h3 className="font-medium text-red-700 dark:text-red-400">
                            Error loading details
                        </h3>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-300 mb-3">
                        {error}
                    </p>
                    <button
                        onClick={goBack}
                        className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 mr-2"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-sm px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-700"
                    >
                        Try again
                    </button>
                </div>
            )}

            {!loading && !error && !mandate && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                        <h3 className="font-medium text-yellow-700 dark:text-yellow-400">
                            Mandate not found
                        </h3>
                    </div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300 mb-3">
                        The mandate you're looking for doesn't exist or you don't have permission to view it.
                    </p>
                    <button
                        onClick={goBack}
                        className="text-sm px-3 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-700"
                    >
                        Go Back
                    </button>
                </div>
            )}

            {!loading && !error && mandate && (
                <div className="space-y-6">
                    {/* Mandate Card */}
                    <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        {/* Header */}
                        <div className="bg-blue-50 dark:bg-blue-900/30 px-6 py-4 border-b border-blue-100 dark:border-blue-800 flex justify-between items-center">
                            <div className="flex items-center">
                                <Building className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                                    {mandate.bankName || "Unknown Bank"}
                                </h3>
                            </div>
                            <div className="flex items-center px-2 py-1 rounded-full bg-opacity-10">
                                {getStatusIcon(mandate.status)}
                                <span
                                    className={`text-sm font-medium ${STATUS_COLORS[mandate.status] ||
                                        STATUS_COLORS.DEFAULT
                                        }`}
                                >
                                    {mandate.status || "UNKNOWN"}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-4">
                            {actionError && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
                                    <div className="flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span>{actionError}</span>
                                    </div>
                                </div>
                            )}

                            {/* Customer Information Banner */}
                            <div className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                                        Basic Information
                                    </h4>

                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <FileText className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Mandate ID
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200">
                                                    {mandate.id || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Building className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Bank
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200">
                                                    {mandate.bankName || "Banking Account"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <DollarSign className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Amount
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200">
                                                    {formatCurrency(mandate.amount)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Category
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200">
                                                    {mandate.category || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Created
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200">
                                                    {formatDate(mandate.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Last Updated
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200">
                                                    {formatDate(mandate.updatedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mandate Details */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                                        Mandate Details
                                    </h4>

                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Variant
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200">
                                                    {mandate.mandateVariant || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Debit Type
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200">
                                                    {mandate.debitType || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Frequency
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200">
                                                    {mandate.freqType || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Sequence Type
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200">
                                                    {mandate.seqType || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Schema Name
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200">
                                                    {mandate.schemaName || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Valid From
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200">
                                                    {formatDate(mandate.startDate)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Valid To
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200">
                                                    {formatDate(mandate.uptoDate)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 mt-6">
                                {mandate.status === "PENDING" && (
                                    <>
                                        <button
                                            onClick={handleAcceptMandate}
                                            disabled={processingAction}
                                            className={`px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors ${processingAction ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                        >
                                            {processingAction ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                "Accept Mandate"
                                            )}
                                        </button>
                                        <button
                                            onClick={handleRejectMandate}
                                            disabled={processingAction}
                                            className={`px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors ${processingAction ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                        >
                                            {processingAction ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                "Reject Mandate"
                                            )}
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={goBack}
                                    className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Loan Details Card */}
                    {loan ? (
                        <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            {/* Loan Header */}
                            <div className="bg-green-50 dark:bg-green-900/30 px-6 py-4 border-b border-green-100 dark:border-green-800 flex justify-between items-center">
                                <div className="flex items-center">
                                    <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                                        Linked Loan Details
                                    </h3>
                                </div>
                                <div className="flex items-center">
                                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${LOAN_STATUS_COLORS[loan.status] || LOAN_STATUS_COLORS.DEFAULT
                                        }`}>
                                        {loan.status || "UNKNOWN"}
                                    </span>
                                </div>
                            </div>

                            {/* Loan Content */}
                            <div className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Loan Basic Info */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                                            Loan Information
                                        </h4>

                                        <div className="space-y-3">
                                            <div className="flex items-start">
                                                <FileText className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Loan ID
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200">
                                                        {loan.id || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <FileText className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Loan Type
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200">
                                                        {loan.loanType || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Banknote className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Principal Amount
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200">
                                                        {formatCurrency(loan.principalAmount)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Banknote className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Outstanding Amount
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200">
                                                        {formatCurrency(loan.outstandingAmount)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Percent className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Interest Rate
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200">
                                                        {loan.interestRate ? `${loan.interestRate}%` : "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Disbursement Date
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200">
                                                        {formatDate(loan.disbursementDate)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Maturity Date
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200">
                                                        {formatDate(loan.maturityDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Loan Payment Details */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                                            Payment Information
                                        </h4>

                                        <div className="space-y-3">
                                            <div className="flex items-start">
                                                <Banknote className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        EMI Amount
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200">
                                                        {formatCurrency(loan.emiAmount)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Next Payment Date
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200">
                                                        {formatDate(loan.nextPaymentDate)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Tenure
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200">
                                                        {loan.tenure ? `${loan.tenure} months` : "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Remaining Installments
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200">
                                                        {loan.remainingInstallments || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <ShieldCheck className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Payment Status
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200">
                                                        {loan.paymentStatus || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Landmark className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Lender
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200">
                                                        {loan.lenderName || mandate.bankName || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : mandate.loanId ? (
                        <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <div className="bg-yellow-50 dark:bg-yellow-900/30 px-6 py-4 border-b border-yellow-100 dark:border-yellow-800">
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                                        Linked Loan Information
                                    </h3>
                                </div>
                            </div>
                            <div className="px-6 py-8 text-center">
                                <p className="text-gray-600 dark:text-gray-400">
                                    This mandate is linked to loan ID: <span className="font-medium">{mandate.loanId}</span>, but the loan details could not be retrieved.
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </main>
    );
}
