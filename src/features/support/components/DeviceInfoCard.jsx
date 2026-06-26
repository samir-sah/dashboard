import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DeviceInfoCard({ device }) {
  if (!device) return null;

  const isWarrantyActive = device.warrantyStatus?.toUpperCase() === "IN WARRANTY" || device.warrantyStatus?.toUpperCase() === "ACTIVE";

  return (
    <Card className="mb-6 shadow-sm border border-gray-200">
      <CardHeader className="pb-4 pt-6 px-6">
        <CardTitle className="text-[17px] font-bold text-gray-900">Device Information</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-5">
        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
            <span className="text-[14px] font-medium text-indigo-600">{device.orderId}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Device Name</span>
            <span className="text-[14px] font-medium text-gray-900">{device.name}</span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Device SKU</span>
            <span className="text-[14px] font-medium text-gray-900">{device.sku}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Serial Number</span>
            <span className="text-[14px] font-medium text-gray-900">{device.serialNumber || "-"}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Purchase Date</span>
            <span className="text-[14px] font-medium text-gray-900">
              {device.purchaseDate ? new Date(device.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric'}) : "-"}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Warranty Status</span>
            <div>
              <Badge variant="outline" className={`border-transparent ${isWarrantyActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {device.warrantyStatus?.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 col-span-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Warranty Valid Till</span>
            <span className="text-[14px] font-medium text-gray-900">
              {device.warrantyValidTill ? new Date(device.warrantyValidTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric'}) : "-"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
