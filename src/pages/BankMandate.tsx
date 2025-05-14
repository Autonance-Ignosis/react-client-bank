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
  Search,
  Filter,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import NotFound from "./NotFound";

// Import UI components
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS = {
  ACTIVE: "bg-green-100 text-green-800 hover:bg-green-200",
  EXPIRED: "bg-red-100 text-red-800 hover:bg-red-200",
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  REVOKED: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  DEFAULT: "bg-blue-100 text-blue-800 hover:bg-blue-200",
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

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
            `Failed to fetch mandates (${mandateResponse.status}): ${errorText || "Unknown error"}`
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
    return <IconComponent className="h-4 w-4 mr-1" />;
  };

  // Filter mandates based on search term and status
  const filteredMandates = bankMandates.filter((mandate) => {
    // const matchesSearch = mandate.id?.includes(searchTerm.toLowerCase()) ||
    //   mandate.bankName?.includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || mandate.status === filterStatus;

    return matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bank Mandates</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your bank mandate authorizations and recurring payments
          </p>
        </div>
        <Button
          onClick={handleRetry}
          variant="outline"
          disabled={loading}
          className="flex items-center self-start"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Search and filter */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by mandate ID or bank name..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <div className="flex items-center">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
            <SelectItem value="REVOKED">Revoked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {error && !loading && (
        <Card className="border-red-200 dark:border-red-800 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 mr-2" />
              Error loading mandates
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-red-600 dark:text-red-300 mb-3">
              {error}
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleRetry}
              variant="destructive"
              size="sm"
            >
              Try again
            </Button>
          </CardFooter>
        </Card>
      )}

      {!loading && !error && filteredMandates.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Building className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
              {bankMandates.length === 0
                ? "No mandates found"
                : "No matching mandates"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {bankMandates.length === 0
                ? "You currently don't have any active mandates with your banks."
                : "Try adjusting your search or filter criteria."}
            </p>
            {bankMandates.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("ALL");
                }}
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && !error && filteredMandates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMandates.map((mandate, index) => (
            <Card
              key={`${mandate.bankId}-${mandate.id || index}`}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigateToMandateDetails(mandate)}
            >
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3 pt-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-base font-medium">
                      {mandate.bankName || "Unknown Bank"}
                    </CardTitle>
                  </div>
                  <Badge className={STATUS_COLORS[mandate.status] || STATUS_COLORS.DEFAULT}>
                    <span className="flex items-center">
                      {getStatusIcon(mandate.status)}
                      {mandate.status || "UNKNOWN"}
                    </span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Mandate ID</span>
                    <span className="font-mono text-sm">{mandate.id || "N/A"}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                      Amount
                    </span>
                    <span className="font-medium">₹{mandate.amount?.toLocaleString() || "N/A"}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      Start Date
                    </span>
                    <span>{formatDate(mandate.startDate || mandate.createdAt)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      Valid Till
                    </span>
                    <span>{formatDate(mandate.uptoDate)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Info className="h-4 w-4 mr-1 text-gray-400" />
                      Debit Type
                    </span>
                    <span className="capitalize">{mandate.freqType || "N/A"} {mandate.debitType?.toLowerCase() || ""}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToMandateDetails(mandate);
                  }}
                >
                  <Info className="h-4 w-4 mr-2" />
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}