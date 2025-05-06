
import { Bell } from "lucide-react";
import { useLoan } from "@/contexts/LoanContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationBell() {
  const { getUnreadApplications, viewApplication } = useLoan();
  const unreadApplications = getUnreadApplications();
  
  // Format date to be more readable
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadApplications.length > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadApplications.length}
            </span>
          )}
          <span className="sr-only">Show notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-medium">Notifications</p>
          <p className="text-xs text-muted-foreground">
            {unreadApplications.length} unread
          </p>
        </div>
        {unreadApplications.length > 0 ? (
          <ScrollArea className="h-80">
            <div className="divide-y">
              {unreadApplications.map((app) => (
                <div 
                  key={app.id} 
                  className="flex cursor-pointer items-start gap-4 p-4 hover:bg-accent"
                  onClick={() => viewApplication(app.id)}
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      New loan application from {app.userDetails.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ₹{app.loanAmount.toLocaleString()} - {formatDate(app.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p className="mb-2">All caught up!</p>
            <p className="text-sm">No new notifications.</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
