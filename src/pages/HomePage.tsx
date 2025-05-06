import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function HomePage() {
  const navigate = useNavigate();

  const { user } = useSelector((state: any) => state.user) || {};
  console.log("HomePage rendered", user);
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Welcome to Autonance Banks</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Empowering banks with seamless mandate management and customer engagement tools.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-2xl font-semibold mb-4">Customer Management</h2>
            <p className="mb-4">Efficiently manage customer profiles and streamline account operations.</p>
            <Button onClick={() => navigate('/customers')}>Manage Customers</Button>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-2xl font-semibold mb-4">Mandate Processing</h2>
            <p className="mb-4">Simplify mandate approvals and automate recurring payment setups.</p>
            <Button onClick={() => navigate('/mandates')}>Process Mandates</Button>
          </div>
        </div>

        <div className="mt-4 bg-card p-6 shadow-sm  border-b mb-3"></div>
        {/* <h2 className="text-2xl font-semibold mb-4">How It Works</h2> */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-primary font-bold text-lg">1</span>
            </div>
            <h3 className="font-medium mb-2">Onboard Customers</h3>
            <p className="text-muted-foreground">Easily onboard customers with our intuitive tools.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-primary font-bold text-lg">2</span>
            </div>
            <h3 className="font-medium mb-2">Verify Documents</h3>
            <p className="text-muted-foreground">Ensure compliance with secure document verification.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-primary font-bold text-lg">3</span>
            </div>
            <h3 className="font-medium mb-2">Manage Mandates</h3>
            <p className="text-muted-foreground">Set up and manage mandates for recurring transactions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
