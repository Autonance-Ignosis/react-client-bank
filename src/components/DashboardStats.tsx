import { useLoan } from "@/contexts/LoanContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardStats({ bankData }) {
  const { applications, getDailyMandates, getMonthlyMandates } = useLoan();

  const dailyMandates = getDailyMandates();
  const monthlyMandates = getMonthlyMandates();

  const approvedApplications = applications.filter(
    (app) => app.approved
  ).length;
  const approvalRate =
    applications.length > 0
      ? Math.round((approvedApplications / applications.length) * 100)
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Daily Mandates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dailyMandates}</div>
          <p className="text-xs text-muted-foreground">
            Applications received today
          </p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Monthly Mandates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{monthlyMandates}</div>
          <p className="text-xs text-muted-foreground">
            Applications received this month
          </p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Total Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{applications.length}</div>
          <p className="text-xs text-muted-foreground">
            Applications processed in total
          </p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{approvalRate}%</div>
          <p className="text-xs text-muted-foreground">Of total applications</p>
        </CardContent>
      </Card>
    </div>
  );
}
