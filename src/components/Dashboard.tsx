import { useLoan } from "@/contexts/LoanContext";
import { DashboardStats } from "@/components/DashboardStats";
import { NotificationPanel } from "@/components/NotificationPanel";
import { LoanResults } from "@/components/LoanResults";

export function Dashboard({ bankData }) {
  const { currentApplication } = useLoan();

  return (
    <div className="container py-8 space-y-8">
      {bankData && (
        <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">
            {bankData.name || "Bank Portal"}
          </h2>
          <p className="text-blue-600">
            Bank ID: {bankData.id || "Loading..."}
          </p>
        </div>
      )}

      {currentApplication ? (
        <LoanResults />
      ) : (
        <>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <DashboardStats bankData={bankData} />
          <NotificationPanel bankId={bankData?.id} />
        </>
      )}
    </div>
  );
}
