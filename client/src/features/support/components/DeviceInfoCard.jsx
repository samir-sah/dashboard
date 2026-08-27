import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DeviceInfoCard({ device }) {
  if (!device) return null;

  const isWarrantyActive = device.warrantyStatus?.toUpperCase() === "IN WARRANTY" || device.warrantyStatus?.toUpperCase() === "ACTIVE";

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="pb-4 pt-6 px-6">
        <CardTitle className="text-[17px] font-bold text-ink">Device Information</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-5">
        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-faint uppercase ">Order ID</span>
            <span className="text-[14px] font-medium text-brand-700">{device.orderId}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-faint uppercase ">Device Name</span>
            <span className="text-[14px] font-medium text-ink">{device.name}</span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-faint uppercase ">Device SKU</span>
            <span className="text-[14px] font-medium text-ink">{device.sku}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-faint uppercase ">Serial Number</span>
            <span className="text-[14px] font-medium text-ink">{device.serialNumber || "-"}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-faint uppercase ">Purchase Date</span>
            <span className="text-[14px] font-medium text-ink">
              {device.purchaseDate ? new Date(device.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric'}) : "-"}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-faint uppercase ">Warranty Status</span>
            <div>
              <Badge variant="outline" className={`border-transparent ${isWarrantyActive ? 'bg-brand-100 text-brand-900' : 'bg-red-100 text-red-800'}`}>
                {device.warrantyStatus?.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 col-span-2">
            <span className="text-[11px] font-bold text-faint uppercase ">Warranty Valid Till</span>
            <span className="text-[14px] font-medium text-ink">
              {device.warrantyValidTill ? new Date(device.warrantyValidTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric'}) : "-"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
