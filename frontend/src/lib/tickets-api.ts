export interface TicketDTO {
  id: number;
  eventId: number;
  eventName: string;
  eventLocation: string;
  eventDate: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  status: string;
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }
  if (!res.ok) {
    throw new Error(data?.message || data?.erro || `Erro ${res.status}`);
  }
  return data;
}

export async function purchaseTicket(
  eventId: number,
  quantity: number,
  token: string,
): Promise<TicketDTO> {
  const res = await fetch("/tickets/purchase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ eventId, quantity }),
  });
  return parseOrThrow<TicketDTO>(res);
}

export async function fetchMyTickets(token: string): Promise<TicketDTO[]> {
  const res = await fetch("/tickets/my", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseOrThrow<TicketDTO[]>(res);
}
