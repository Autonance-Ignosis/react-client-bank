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
  Info,
  User,
  DollarSign,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();

  const user = useSelector((state: any) => state?.user?.user || {});
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
            `Failed to fetch mandates (${mandateResponse.status}): ${errorText || "Unknown error"
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

  const navigateToMandateDetails = (mandate) => {
    navigate(`/bank-mandates/${mandate.id}`);
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

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-6">
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
                onClick={() => navigateToMandateDetails(mandate)}
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
                      className={`text-xs font-medium ${STATUS_COLORS[mandate.status] || STATUS_COLORS.DEFAULT
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
                        navigateToMandateDetails(mandate);
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
      </div>
    </>
  );
}