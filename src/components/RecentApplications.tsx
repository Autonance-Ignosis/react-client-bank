
import { useLoan, LoanApplication } from "@/contexts/LoanContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RecentApplications() {
  const { applications } = useLoan();
  
  // Get only the 5 most recent applications
  const recentApplications = [...applications].slice(0, 5);

  // Format date to be more readable
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
        <CardDescription>You have {applications.length} total applications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentApplications.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No applications yet</p>
          ) : (
            recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-semibold">{app.userDetails.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    ₹{app.loanAmount.toLocaleString()} - {formatDate(app.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    CIBIL: <span className="font-medium">{app.cibilScore}</span>
                  </div>
                  <Badge variant={app.approved ? "default" : "destructive"}>
                    {app.approved ? "Approved" : "Rejected"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
