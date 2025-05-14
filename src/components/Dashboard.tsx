import { NotificationPanel } from "@/components/NotificationPanel";

export function Dashboard({ bankData }) {

  return (
    <div className="container py-8 space-y-8">
      {bankData && (
        <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">
            <p>
              {bankData.name || "Bank Portal"} 
            </p>
            <p>
              ISFC CODE : {bankData.ifsc}
            </p>

          </h2>
        </div>
      )}
      <NotificationPanel bankId={bankData?.id} />



    </div>
  );
}
