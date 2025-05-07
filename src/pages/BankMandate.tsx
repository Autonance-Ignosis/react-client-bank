import { useState, useEffect } from "react";
import {
  Building,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCcw,
  X,
  Check,
  Info,
  User,
  DollarSign,
} from "lucide-react";
import { useSelector } from "react-redux";
import NotFound from "./NotFound";

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

export default function BankMandate() {
  const [bankMandates, setBankMandates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bankLoading, setBankLoading] = useState(false);
  const [mandateLoading, setMandateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedMandate, setSelectedMandate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [actionError, setActionError] = useState(null);

  const user = useSelector((state) => state?.user?.user || {});
  const userId = user?.id;
  const bank = user?.bank || null;

  const fetchData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setBankLoading(true);
    setError(null);

    try {
      const mandateResults = [];

      try {
        const mandateResponse = await fetch(
          `http://localhost:8080/api/mandates/bank/${bank.id}`
        );

        if (!mandateResponse.ok) {
          const errorText = await mandateResponse.text();
          throw new Error(
            `Failed to fetch mandates (${mandateResponse.status}): ${
              errorText || "Unknown error"
            }`
          );
        }

        const mandatedata = await mandateResponse.json();

        if (Array.isArray(mandatedata)) {
          mandatedata.forEach((mandate) => {
            mandateResults.push({
              ...mandate,
              bankName: bank.name,
              bankId: bank.id,
            });
          });
        } else if (mandatedata) {
          mandateResults.push({
            ...mandatedata,
            bankName: bank.name,
            bankId: bank.id,
          });
        }

        setBankMandates(mandateResults);
      } catch (err) {
        console.error("Error fetching mandates:", err);
        setError(err.message || "Failed to load bank mandates");
      } finally {
        setMandateLoading(false);
      }
    } catch (err) {
      console.error("Error fetching banks:", err);
      setError(err.message || "Failed to load banks");
    } finally {
      setLoading(false);
      setBankLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, retryCount]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const openMandateDetails = (mandate) => {
    setSelectedMandate(mandate);
    setModalOpen(true);
    setActionError(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMandate(null);
    setActionError(null);
  };

  const handleAcceptMandate = async (mandateId) => {
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
          // You can add body if needed
          // body: JSON.stringify({ status: 'ACTIVE' })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to approve mandate (${response.status}): ${
            errorText || "Unknown error"
          }`
        );
      }

      // Update local state to show acceptance
      setBankMandates((prevMandates) =>
        prevMandates.map((mandate) =>
          mandate.id === mandateId ? { ...mandate, status: "ACTIVE" } : mandate
        )
      );

      if (selectedMandate?.id === mandateId) {
        setSelectedMandate((prev) => ({ ...prev, status: "ACTIVE" }));
      }

      // Close modal after successful action
      setTimeout(() => {
        setModalOpen(false);
        setSelectedMandate(null);
        setProcessingAction(false);
      }, 500);

      // Refresh the data
      setTimeout(() => {
        handleRetry();
      }, 1000);
    } catch (error) {
      console.error("Error accepting mandate:", error);
      setActionError(
        error.message || "Failed to approve mandate. Please try again."
      );
      setProcessingAction(false);
    }
  };

  const handleRejectMandate = async (mandateId) => {
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
          // You can add body if needed
          // body: JSON.stringify({ status: 'REVOKED' })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to reject mandate (${response.status}): ${
            errorText || "Unknown error"
          }`
        );
      }

      // Update local state to show rejection
      setBankMandates((prevMandates) =>
        prevMandates.map((mandate) =>
          mandate.id === mandateId ? { ...mandate, status: "REVOKED" } : mandate
        )
      );

      if (selectedMandate?.id === mandateId) {
        setSelectedMandate((prev) => ({ ...prev, status: "REVOKED" }));
      }

      // Close modal after successful action
      setTimeout(() => {
        setModalOpen(false);
        setSelectedMandate(null);
        setProcessingAction(false);
      }, 500);

      // Refresh the data
      setTimeout(() => {
        handleRetry();
      }, 1000);
    } catch (error) {
      console.error("Error rejecting mandate:", error);
      setActionError(
        error.message || "Failed to reject mandate. Please try again."
      );
      setProcessingAction(false);
    }
  };

  if (!userId) {
    return <NotFound />;
  }

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

  const getStatusIcon = (status) => {
    const IconComponent = STATUS_ICONS[status] || STATUS_ICONS.DEFAULT;
    const colorClass = STATUS_COLORS[status] || STATUS_COLORS.DEFAULT;
    return <IconComponent className={`${colorClass} h-4 w-4 mr-1`} />;
  };

  // Modal component for mandate details
  const MandateDetailsModal = () => {
    if (!modalOpen || !selectedMandate) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-blue-50 dark:bg-blue-900/30 px-6 py-4 border-b border-blue-100 dark:border-blue-800 flex justify-between items-center">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                Mandate Details
              </h3>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <span className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                  {selectedMandate.bankName || "Unknown Bank"}
                </span>
              </div>
              <div className="flex items-center px-2 py-1 rounded-full bg-opacity-10">
                {getStatusIcon(selectedMandate.status)}
                <span
                  className={`text-sm font-medium ${
                    STATUS_COLORS[selectedMandate.status] ||
                    STATUS_COLORS.DEFAULT
                  }`}
                >
                  {selectedMandate.status || "UNKNOWN"}
                </span>
              </div>
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Basic Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-1">
                  Basic Information
                </h4>

                <div className="flex items-start">
                  <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Mandate ID
                    </p>
                    <p className="font-mono text-gray-800 dark:text-gray-200">
                      {selectedMandate.id || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      User ID
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {selectedMandate.userId || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Building className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Bank Account
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      ID: {selectedMandate.bankAccountId || "N/A"} (Bank ID:{" "}
                      {selectedMandate.bankId || "N/A"})
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
                      {selectedMandate.amount
                        ? `₹${selectedMandate.amount.toLocaleString()}`
                        : "Not specified"}
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
                      {selectedMandate.category || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Loan ID
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {selectedMandate.loanId || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mandate Details */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-1">
                  Mandate Details
                </h4>

                <div className="flex items-start">
                  <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Variant
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {selectedMandate.mandateVariant || "N/A"}
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
                      {selectedMandate.debitType || "N/A"}
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
                      {selectedMandate.freqType || "N/A"}
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
                      {selectedMandate.seqType || "N/A"}
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
                      {selectedMandate.schemaName || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Reference No.
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {selectedMandate.consRefNo || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-3 col-span-1 md:col-span-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-1">
                  Timeline
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Created At
                      </p>
                      <p className="text-gray-800 dark:text-gray-200">
                        {formatDate(selectedMandate.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Start Date
                      </p>
                      <p className="text-gray-800 dark:text-gray-200">
                        {selectedMandate.startDate || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Valid Until
                      </p>
                      <p className="text-gray-800 dark:text-gray-200">
                        {selectedMandate.uptoDate || "N/A"}
                      </p>
                      {selectedMandate.upTo40Years && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          (Extended for 40 years)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Last updated: {formatDate(selectedMandate.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
            {selectedMandate.status === "PENDING" && (
              <>
                <button
                  onClick={() => handleRejectMandate(selectedMandate.id)}
                  disabled={processingAction}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processingAction ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </button>
                <button
                  onClick={() => handleAcceptMandate(selectedMandate.id)}
                  disabled={processingAction}
                  className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processingAction ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Accept
                </button>
              </>
            )}
            {selectedMandate.status !== "PENDING" && (
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md font-medium transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Your Bank Mandates
          </h1>
          <button
            onClick={handleRetry}
            disabled={loading}
            className="flex items-center px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-sm transition-colors"
          >
            <RefreshCcw
              className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {bankLoading
                  ? "Fetching your banks..."
                  : mandateLoading
                  ? "Loading your mandates..."
                  : "Loading..."}
              </p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <h3 className="font-medium text-red-700 dark:text-red-400">
                Error loading mandates
              </h3>
            </div>
            <p className="text-sm text-red-600 dark:text-red-300 mb-3">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="text-sm px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && bankMandates.length === 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <Building className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
              No mandates found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You currently don't have any active mandates with your banks.
            </p>
          </div>
        )}

        {!loading && !error && bankMandates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankMandates.map((mandate, index) => (
              <div
                key={`${mandate.bankId}-${mandate.id || index}`}
                className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openMandateDetails(mandate)}
              >
                <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {mandate.bankName || "Unknown Bank"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(mandate.status)}
                    <span
                      className={`text-xs font-medium ${
                        STATUS_COLORS[mandate.status] || STATUS_COLORS.DEFAULT
                      }`}
                    >
                      {mandate.status || "UNKNOWN"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="space-y-2 mb-3">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Mandate ID:</span>{" "}
                      <span className="font-mono">{mandate.id || "N/A"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <DollarSign className="h-4 w-4 mr-1.5 text-gray-500" />
                      Amount: ₹{mandate.amount?.toLocaleString() || "N/A"}
                    </div>
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                      Start:{" "}
                      {mandate.startDate || formatDate(mandate.createdAt)}
                    </div>
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                      Valid Till: {mandate.uptoDate || "N/A"}
                    </div>
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <Info className="h-4 w-4 mr-1.5 text-gray-500" />
                      {mandate.freqType || "N/A"}{" "}
                      {mandate.debitType?.toLowerCase() || ""} debit
                    </div>
                  </div>

                  <div className="flex justify-center mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openMandateDetails(mandate);
                      }}
                      className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-sm font-medium transition-colors flex items-center"
                    >
                      <Info className="h-4 w-4 mr-1.5" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Render the modal component */}
        <MandateDetailsModal />
      </main>
    </>
  );
}
