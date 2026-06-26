import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function CustomerInfoCard({ customer }) {
  if (!customer) return null;

  return (
    <Card className="mb-6 shadow-sm border border-gray-200">
      <CardHeader className="pb-4 pt-6 px-6">
        <CardTitle className="text-[17px] font-bold text-gray-900">Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Customer Name</span>
            <span className="text-[14px] font-medium text-gray-900 break-words">{customer.name}</span>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
            <span className="text-[14px] font-medium text-gray-900 break-words">{customer.phone}</span>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</span>
            <span className="text-[14px] font-medium text-gray-900 break-all">{customer.email}</span>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Customer ID</span>
            <span className="text-[14px] font-medium text-gray-900 break-all leading-5">{customer.id}</span>
          </div>
        </div>
        
        <div className="flex min-w-0 flex-col gap-1.5 pt-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Address</span>
          <span className="text-[14px] font-medium text-gray-900 break-words">{customer.address || "Not provided"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
