// import { useAuth } from "@/contexts/AuthContext";
// import { Header } from "@/components/Header";
// import { LoginForm } from "@/components/LoginForm";
// import { Dashboard } from "@/components/Dashboard";
// import { NotificationBell } from "@/components/NotificationBell";
// import { useSelector } from "react-redux";
// import { useEffect } from "react";

// const Index = () => {
//   const { user } = useSelector((state: any) => state.user) || {};

//   const isBank = user?.role == "BANK" || false;

//   const bank;

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />

//       {isBank ? (
//         <div className="flex-1 flex flex-col items-center justify-center p-4">
//           <div className="flex-1 w-full max-w-3xl mx-auto">
//             <Dashboard />
//           </div>
//           <NotificationBell />
//         </div>
//       ) : (
//         <div className="flex-1 flex items-center justify-center">
//           <div className="w-full max-w-md p-4  rounded-lg shadow-md">
//             <h2 className="text-2xl font-bold mb-4">
//               Welcome to the Loan Application Portal
//             </h2>
//             <p className="mb-4">Please log in to continue.</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Index;

import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { LoginForm } from "@/components/LoginForm";
import { Dashboard } from "@/components/Dashboard";
import { NotificationBell } from "@/components/NotificationBell";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const Index = () => {
  const { user } = useSelector((state: any) => state.user) || {};
  const isBank = user?.role === "BANK" || false;
  const [bank, setBank] = useState(null);

  useEffect(() => {
    // Fetch bank details if user is logged in and has the bank role
    const fetchBankDetails = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/banks/user/${user.id}`
          );
          if (response.ok) {
            const bankData = await response.json();
            setBank(bankData);
          } else {
            console.error("Failed to fetch bank details");
          }
        } catch (error) {
          console.error("Error fetching bank details:", error);
        }
      }
    };

    if (isBank) {
      fetchBankDetails();
    }
  }, [user, isBank]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {isBank ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="flex-1 w-full max-w-3xl mx-auto">
            <Dashboard bankData={bank} />
          </div>
          {/* <NotificationBell /> */}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md p-4 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">
              Welcome to the Loan Application Portal
            </h2>
            <p className="mb-4">Please log in to continue.</p>
            {/* <LoginForm /> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
