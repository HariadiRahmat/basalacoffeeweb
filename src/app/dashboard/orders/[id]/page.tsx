import { OrderDetailDashboard } from "@/components/order-detail-dashboard";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailDashboard orderId={id} />;
}
