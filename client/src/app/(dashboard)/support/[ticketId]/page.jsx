import TicketDetailsPage from "@/features/support/pages/TicketDetailsPage";

export async function generateMetadata({ params }) {
  const { ticketId } = await params;
  return {
    title: `Ticket ${ticketId} | Synera Dashboard`,
    description: "Support ticket details",
  };
}

export default function TicketDetailsRoute() {
  return <TicketDetailsPage />;
}
