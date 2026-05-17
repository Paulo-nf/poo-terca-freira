import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchMyTickets, type TicketDTO } from "@/lib/tickets-api";
import { formatDate, formatPrice } from "@/lib/event-utils";

interface MyTicketsPageProps {
  onVerEvento?: (eventoId: number) => void;
}

export function MyTicketsPage({ onVerEvento }: MyTicketsPageProps) {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchMyTickets(token)
      .then(setTickets)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingState />;
  if (erro) return <ErrorState message={erro} />;

  const now = new Date();
  const futuros = tickets
    .filter((t) => new Date(t.eventDate) > now)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  const passados = tickets
    .filter((t) => new Date(t.eventDate) <= now)
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

  return (
    <div className="min-h-[80vh] px-12 py-10 max-md:px-5">
      <h1 className="font-heading text-[28px] font-black text-blue-dark mb-1">Meus ingressos</h1>
      <p className="text-[13.5px] text-muted-foreground mb-10">
        {tickets.length === 0
          ? "Você ainda não comprou nenhum ingresso."
          : `${tickets.length} ingresso(s) no total`}
      </p>

      {tickets.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎟️</div>
          <p className="font-heading text-[17px] font-extrabold text-blue-dark mb-2">
            Nenhum ingresso ainda
          </p>
          <p className="text-[13.5px] text-muted-foreground">
            Explore os eventos disponíveis e garanta o seu lugar!
          </p>
        </div>
      )}

      {futuros.length > 0 && (
        <TicketSection
          title="Próximos eventos"
          tickets={futuros}
          future
          onVerEvento={onVerEvento}
        />
      )}

      {passados.length > 0 && (
        <TicketSection
          title="Eventos passados"
          tickets={passados}
          future={false}
          onVerEvento={onVerEvento}
        />
      )}
    </div>
  );
}

function TicketSection({
  title,
  tickets,
  future,
  onVerEvento,
}: {
  title: string;
  tickets: TicketDTO[];
  future: boolean;
  onVerEvento?: (id: number) => void;
}) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-heading text-[15px] font-extrabold text-blue-dark uppercase tracking-wide">
          {title}
        </h2>
        <span className="text-[11px] font-extrabold bg-surface2 text-muted-foreground px-2 py-0.5 rounded-full">
          {tickets.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            future={future}
            onVerEvento={onVerEvento}
          />
        ))}
      </div>
    </div>
  );
}

function TicketCard({
  ticket,
  future,
  onVerEvento,
}: {
  ticket: TicketDTO;
  future: boolean;
  onVerEvento?: (id: number) => void;
}) {
  const { day, month, year } = formatDate(ticket.eventDate);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-card border rounded-[16px] p-5 shadow-sm flex flex-col gap-4 transition-opacity ${
        future ? "border-blue/20" : "border-border opacity-70"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading text-[15px] font-extrabold text-blue-dark leading-snug truncate">
            {ticket.eventName}
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
            {ticket.eventLocation}
          </p>
        </div>
        <span
          className={`shrink-0 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full ${
            future
              ? "bg-blue-light text-blue-dark"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {future ? "Confirmado" : "Realizado"}
        </span>
      </div>

      {/* Date badge */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-[10px] bg-surface2 shrink-0">
          <span className="font-heading text-[18px] font-black text-blue-dark leading-none">
            {day}
          </span>
          <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wide">
            {month}
          </span>
        </div>
        <div className="text-[12.5px] text-muted-foreground">
          <p className="font-semibold">{year}</p>
          <p>às 20:00</p>
        </div>
      </div>

      {/* Ticket count + total */}
      <div className="border-t border-border pt-3 flex items-center justify-between">
        <span className="text-[12.5px] text-muted-foreground">
          {ticket.quantity} ingresso(s)
        </span>
        <span className="font-heading text-[16px] font-black text-blue-dark">
          {ticket.totalPrice === 0 ? "Gratuito" : formatPrice(ticket.totalPrice)}
        </span>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-[11.5px] font-bold text-blue hover:text-blue-dark transition-colors text-left"
      >
        {expanded ? "Ocultar detalhes ▲" : "Ver detalhes ▼"}
      </button>

      {expanded && (
        <div className="border-t border-border pt-3 space-y-1.5 text-[12px]">
          <DetailRow label="Comprador" value={ticket.buyerName} />
          <DetailRow label="E-mail" value={ticket.buyerEmail} />
          <DetailRow label="Pedido nº" value={String(ticket.id)} />
          <DetailRow
            label="Comprado em"
            value={formatDate(ticket.purchaseDate).day + " " +
              formatDate(ticket.purchaseDate).month + " " +
              formatDate(ticket.purchaseDate).year}
          />
          <DetailRow label="Status" value={ticket.status} />
        </div>
      )}

      {onVerEvento && future && (
        <button
          onClick={() => onVerEvento(ticket.eventId)}
          className="text-[12px] font-extrabold text-center py-2 rounded-[10px] border border-blue/30 text-blue hover:bg-blue-light transition-colors"
        >
          Ver evento
        </button>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-blue-dark text-right truncate max-w-[60%]">{value}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-[80vh] px-12 py-10 max-md:px-5">
      <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-32 bg-muted rounded-lg animate-pulse mb-10" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-[16px] h-52 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center text-center px-5">
      <div>
        <div className="text-4xl mb-4">⚠️</div>
        <p className="font-heading text-[17px] font-extrabold text-blue-dark mb-2">
          Não foi possível carregar
        </p>
        <p className="text-[13.5px] text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
