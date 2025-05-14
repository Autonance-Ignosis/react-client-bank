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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, IndianRupee, Clock, Info, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function NotificationPanel({ bankId }) {
  const navigate = useNavigate();
  const [bankLoans, setBankLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  // Stats for dashboard
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });

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
          const loans = Array.isArray(data) ? data : [];
          setBankLoans(loans);

          // Calculate stats
          const stats = {
            total: loans.length,
            pending: loans.filter(loan => loan.status === "PENDING").length,
            approved: loans.filter(loan => loan.status === "APPROVED").length,
            rejected: loans.filter(loan => loan.status === "REJECTED").length,
            totalAmount: loans.reduce((sum, loan) => sum + (Number(loan.amount) || 0), 0)
          };

          setStats(stats);

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

  // Filter and sort loans whenever any dependency changes
  useEffect(() => {
    let result = [...bankLoans];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(loan => loan.status === statusFilter.toUpperCase());
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(loan =>
        (loan.userId && loan.userId.toLowerCase().includes(term)) ||
        (loan.purpose && getPurposeLabel(loan.purpose).toLowerCase().includes(term))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime();
      } else if (sortOrder === "oldest") {
        return new Date(a.appliedAt || 0).getTime() - new Date(b.appliedAt || 0).getTime();
      } else if (sortOrder === "highest") {
        return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      } else if (sortOrder === "lowest") {
        return (Number(a.amount) || 0) - (Number(b.amount) || 0);
      }
      return 0;
    });

    setFilteredLoans(result);
  }, [bankLoans, searchTerm, statusFilter, sortOrder]);

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

  // Navigate to loan detail page
  const handleViewApplication = (loanId) => {
    if (!loanId) return;
    navigate(`/loan-detail/${loanId}`);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case "PENDING":
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
    }
  };

  // Render loan card
  const renderLoanCard = (loan) => {
    if (!loan) return null;

    return (
      <div
        key={loan.id || `loan-${Math.random()}`}
        className="border rounded-lg p-4 hover:bg-accent/30 transition-colors shadow-sm"
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">User ID: {loan.userId || "N/A"}</h3>
              {getStatusBadge(loan.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              {getPurposeLabel(loan.purpose)} • Applied {formatDate(loan.appliedAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">₹{formatAmount(loan.amount)}</p>
            <p className="text-xs text-muted-foreground">
              {loan.tenureInMonths || "N/A"} months @ {loan.interestRate || "N/A"}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
          <div className="flex items-center gap-1 text-sm">
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
            <span>EMI: <span className="font-medium">₹{formatEmi(loan.emi)}</span></span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Tenure: <span className="font-medium">{loan.tenureInMonths || "N/A"} months</span></span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewApplication(loan.id);
            }}
            className="gap-1"
          >
            <Info className="h-4 w-4" />
            <span>View Details</span>
          </Button>
        </div>
      </div>
    );
  };

  // Render stats dashboard
  const renderStatsDashboard = () => {
    return (
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Applications</p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <h3 className="text-2xl font-bold">{stats.pending}</h3>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Approved</p>
            <h3 className="text-2xl font-bold">{stats.approved}</h3>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <h3 className="text-2xl font-bold">{stats.rejected}</h3>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render filters and search
  const renderFilters = () => {
    return (
      <div className="flex gap-4 mb-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user ID or purpose..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest">Highest Amount</SelectItem>
            <SelectItem value="lowest">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Loan Applications Dashboard</h1>

      {renderStatsDashboard()}

      <Card className="border rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Loan Applications</span>
            <Badge variant="outline" className="font-normal">
              {filteredLoans?.length || 0} {filteredLoans.length === 1 ? "application" : "applications"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage loan applications from users
          </CardDescription>

          {renderFilters()}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Applications</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ScrollArea className="h-[500px] pr-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Loading applications...</p>
                  </div>
                ) : !filteredLoans || filteredLoans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CalendarDays className="h-16 w-16 mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No loan applications found</p>
                    <p className="text-sm">New applications will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLoans.map(renderLoanCard)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="pending">
              <ScrollArea className="h-[500px] pr-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Loading applications...</p>
                  </div>
                ) : filteredLoans.filter(loan => loan.status === "PENDING").length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CalendarDays className="h-16 w-16 mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No pending applications</p>
                    <p className="text-sm">Any pending applications will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLoans.filter(loan => loan.status === "PENDING").map(renderLoanCard)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="approved">
              <ScrollArea className="h-[500px] pr-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Loading applications...</p>
                  </div>
                ) : filteredLoans.filter(loan => loan.status === "APPROVED").length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CalendarDays className="h-16 w-16 mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No approved applications</p>
                    <p className="text-sm">Any approved applications will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLoans.filter(loan => loan.status === "APPROVED").map(renderLoanCard)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="rejected">
              <ScrollArea className="h-[500px] pr-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Loading applications...</p>
                  </div>
                ) : filteredLoans.filter(loan => loan.status === "REJECTED").length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CalendarDays className="h-16 w-16 mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No rejected applications</p>
                    <p className="text-sm">Any rejected applications will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLoans.filter(loan => loan.status === "REJECTED").map(renderLoanCard)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}