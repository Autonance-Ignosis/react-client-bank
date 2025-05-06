import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

interface UserDetails {
  fullName: string;
  panCardNumber: string;
  email: string;
  phone: string;
}

export interface LoanApplication {
  id: string;
  bankDetails: BankDetails;
  loanAmount: number;
  userDetails: UserDetails;
  cibilScore?: number;
  approved?: boolean;
  riskAssessment?: "low" | "medium" | "high";
  createdAt: Date;
  isRead?: boolean;
}

interface LoanContextType {
  applications: LoanApplication[];
  currentApplication: LoanApplication | null;
  submitApplication: (
    application: Omit<
      LoanApplication,
      | "id"
      | "createdAt"
      | "cibilScore"
      | "approved"
      | "riskAssessment"
      | "isRead"
    >
  ) => void;
  resetCurrentApplication: () => void;
  getDailyMandates: () => number;
  getMonthlyMandates: () => number;
  getUnreadApplications: () => LoanApplication[];
  viewApplication: (applicationId: string) => void;
  approveLoan: (applicationId: string) => void;
  rejectLoan: (applicationId: string) => void;
  calculateCibilScore: (applicationId: string) => void;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

// Helper function to generate a random CIBIL score between 300-900
const generateCibilScore = (): number => {
  return Math.floor(Math.random() * (900 - 300 + 1) + 300);
};

// Helper function to determine approval based on CIBIL score
const determineApproval = (cibilScore: number): boolean => {
  return cibilScore >= 650;
};

// Helper function to determine risk assessment
const determineRiskAssessment = (
  cibilScore: number
): "low" | "medium" | "high" => {
  if (cibilScore >= 750) return "low";
  if (cibilScore >= 650) return "medium";
  return "high";
};

export const LoanProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [currentApplication, setCurrentApplication] =
    useState<LoanApplication | null>(null);

  // Load applications from localStorage
  useEffect(() => {
    const savedApplications = localStorage.getItem("bank-loan-applications");

    if (savedApplications) {
      // Convert string dates back to Date objects
      const parsedApplications = JSON.parse(savedApplications).map(
        (app: any) => ({
          ...app,
          createdAt: new Date(app.createdAt),
          isRead: app.isRead || false,
        })
      );

      setApplications(parsedApplications);
    } else {
      // Create some dummy unread applications if none exist
      const dummyApplications: LoanApplication[] = [
        {
          id: `LOAN-${Date.now().toString(36).toUpperCase()}-1`,
          bankDetails: {
            bankName: "HDFC Bank",
            accountNumber: "12345678901",
            ifscCode: "HDFC0001234",
          },
          userDetails: {
            fullName: "John Doe",
            panCardNumber: "ABCPD1234F",
            email: "john@example.com",
            phone: "9876543210",
          },
          loanAmount: 500000,
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          isRead: false,
        },
        {
          id: `LOAN-${Date.now().toString(36).toUpperCase()}-2`,
          bankDetails: {
            bankName: "ICICI Bank",
            accountNumber: "98765432109",
            ifscCode: "ICIC0002345",
          },
          userDetails: {
            fullName: "Jane Smith",
            panCardNumber: "DEFPS5678G",
            email: "jane@example.com",
            phone: "8765432109",
          },
          loanAmount: 750000,
          createdAt: new Date(),
          isRead: false,
        },
      ];

      setApplications(dummyApplications);
      localStorage.setItem(
        "bank-loan-applications",
        JSON.stringify(dummyApplications)
      );
    }
  }, []);

  // Save applications to localStorage whenever they change
  useEffect(() => {
    if (applications.length > 0) {
      localStorage.setItem(
        "bank-loan-applications",
        JSON.stringify(applications)
      );
    }
  }, [applications]);

  const submitApplication = (
    application: Omit<
      LoanApplication,
      | "id"
      | "createdAt"
      | "cibilScore"
      | "approved"
      | "riskAssessment"
      | "isRead"
    >
  ) => {
    // Create a new application with id and timestamps
    const newApplication: LoanApplication = {
      ...application,
      id: `LOAN-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date(),
      isRead: false,
    };

    // Update the applications state
    setApplications((prev) => [newApplication, ...prev]);

    toast({
      title: "New Application Received",
      description: "A new loan application has been received.",
    });
  };

  const resetCurrentApplication = () => {
    setCurrentApplication(null);
  };

  // Calculate daily mandates
  const getDailyMandates = (): number => {
    const today = new Date();
    return applications.filter((app) => {
      const appDate = new Date(app.createdAt);
      return (
        appDate.getDate() === today.getDate() &&
        appDate.getMonth() === today.getMonth() &&
        appDate.getFullYear() === today.getFullYear()
      );
    }).length;
  };

  // Calculate monthly mandates
  const getMonthlyMandates = (): number => {
    const today = new Date();
    return applications.filter((app) => {
      const appDate = new Date(app.createdAt);
      return (
        appDate.getMonth() === today.getMonth() &&
        appDate.getFullYear() === today.getFullYear()
      );
    }).length;
  };

  // Get unread applications
  const getUnreadApplications = (): LoanApplication[] => {
    return applications.filter((app) => !app.isRead);
  };

  // View an application (mark as read and set as current)
  const viewApplication = (applicationId: string) => {
    const application = applications.find((app) => app.id === applicationId);

    if (application) {
      // Mark the application as read
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.id === applicationId ? { ...app, isRead: true } : app
        )
      );

      // Set as current application
      setCurrentApplication({ ...application, isRead: true });
    }
  };

  // Calculate CIBIL score for an application
  const calculateCibilScore = (applicationId: string) => {
    const cibilScore = generateCibilScore();
    const approved = determineApproval(cibilScore);
    const riskAssessment = determineRiskAssessment(cibilScore);

    // Update the application with the CIBIL score, approval status, and risk assessment
    setApplications((prevApplications) =>
      prevApplications.map((app) =>
        app.id === applicationId
          ? { ...app, cibilScore, approved, riskAssessment }
          : app
      )
    );

    // If this is the current application, update it as well
    if (currentApplication && currentApplication.id === applicationId) {
      setCurrentApplication({
        ...currentApplication,
        cibilScore,
        approved,
        riskAssessment,
      });
    }

    toast({
      title: "CIBIL Score Calculated",
      description: `CIBIL Score: ${cibilScore}`,
    });
  };

  // Approve a loan
  const approveLoan = (applicationId: string) => {
    setApplications((prevApplications) =>
      prevApplications.map((app) =>
        app.id === applicationId ? { ...app, approved: true } : app
      )
    );

    // Update current application if it's the same one
    if (currentApplication && currentApplication.id === applicationId) {
      setCurrentApplication({
        ...currentApplication,
        approved: true,
      });
    }

    toast({
      title: "Loan Approved",
      description: "The loan application has been approved.",
    });
  };

  // Reject a loan
  const rejectLoan = (applicationId: string) => {
    setApplications((prevApplications) =>
      prevApplications.map((app) =>
        app.id === applicationId ? { ...app, approved: false } : app
      )
    );

    // Update current application if it's the same one
    if (currentApplication && currentApplication.id === applicationId) {
      setCurrentApplication({
        ...currentApplication,
        approved: false,
      });
    }

    toast({
      title: "Loan Rejected",
      description: "The loan application has been rejected.",
    });
  };

  return (
    <LoanContext.Provider
      value={{
        applications,
        currentApplication,
        submitApplication,
        resetCurrentApplication,
        getDailyMandates,
        getMonthlyMandates,
        getUnreadApplications,
        viewApplication,
        calculateCibilScore,
        approveLoan,
        rejectLoan,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
};

export const useLoan = (): LoanContextType => {
  const context = useContext(LoanContext);

  if (context === undefined) {
    throw new Error("useLoan must be used within a LoanProvider");
  }

  return context;
};
