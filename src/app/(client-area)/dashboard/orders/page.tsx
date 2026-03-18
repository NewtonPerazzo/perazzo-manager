import { OrdersTemplate } from "@/components/templates/dashboard/orders-template";

export default function OrdersPage() {
  return (
    <OrdersTemplate
      initialData={[]}
      paymentMethods={[]}
      deliveryMethods={[]}
      initialStoreWhatsapp=""
    />
  );
}
