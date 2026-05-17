import { useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { type Evento } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/event-utils";
import { purchaseTicket, type TicketDTO } from "@/lib/tickets-api";

interface PaymentPageProps {
  evento: Evento;
  quantidade: number;
  onVoltar: () => void;
  onSucesso: (ticket: TicketDTO) => void;
}

export function PaymentPage({ evento, quantidade, onVoltar, onSucesso }: PaymentPageProps) {
  const { token } = useAuth();
  const isFree = evento.preco <= 0;

  const [nomeCartao, setNomeCartao] = useState("");
  const [numeroCartao, setNumeroCartao] = useState("");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<TicketDTO | null>(null);

  const { day, month, year } = formatDate(evento.data);
  const total = evento.preco * quantidade;

  function maskCardNumber(val: string) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }

  function maskExpiry(val: string) {
    return val.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
  }

  async function confirmar() {
    if (!token) { setErro("Você precisa estar logado para continuar."); return; }
    setLoading(true);
    setErro(null);
    try {
      const ticket = await purchaseTicket(evento.id, quantidade, token);
      setSucesso(ticket);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao processar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await confirmar();
  }

  const orderSummary = (
    <div className="bg-card border border-border rounded-[14px] p-5 lg:sticky lg:top-6">
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-4">
        Resumo do pedido
      </p>
      <p className="font-heading text-[15px] font-extrabold text-blue-dark leading-snug mb-0.5">
        {evento.nome}
      </p>
      <p className="text-[12.5px] text-muted-foreground mb-5">
        {day} {month.toLowerCase()} {year}
      </p>
      <div className="border-t border-border pt-4 space-y-2 text-[13px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Ingresso × {quantidade}</span>
          <span className="font-bold text-blue-dark">
            {isFree ? "Gratuito" : formatPrice(evento.preco)}
          </span>
        </div>
        <div className="flex justify-between items-baseline border-t border-border pt-3 mt-1">
          <span className="font-extrabold text-blue-dark">Total</span>
          <span className="font-heading text-[20px] font-black text-blue-dark">
            {isFree ? "Gratuito" : formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );

  if (sucesso) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-[460px] text-center">
          <div className="text-6xl mb-5">🎉</div>
          <h2 className="font-heading text-[26px] font-black text-blue-dark mb-2">
            {isFree ? "Inscrição confirmada!" : "Compra realizada!"}
          </h2>
          <p className="text-[14px] text-muted-foreground mb-6">
            Seus ingressos para <strong>{sucesso.eventName}</strong> foram confirmados.
          </p>

          <div className="bg-surface2 rounded-[14px] p-5 text-left mb-6 space-y-2.5">
            <SummaryRow label="Evento" value={sucesso.eventName} />
            <SummaryRow label="Local" value={sucesso.eventLocation} />
            <SummaryRow label="Quantidade" value={`${sucesso.quantity} ingresso(s)`} />
            <SummaryRow
              label="Total"
              value={sucesso.totalPrice === 0 ? "Gratuito" : formatPrice(sucesso.totalPrice)}
            />
            <SummaryRow label="Pedido nº" value={String(sucesso.id)} />
          </div>

          <button
            onClick={() => onSucesso(sucesso)}
            className="w-full py-3 rounded-[12px] text-[14px] font-extrabold bg-blue text-primary-foreground hover:bg-blue-dark transition-colors"
          >
            Ver meus ingressos
          </button>
        </div>
      </div>
    );
  }

  const backButton = (
    <button
      onClick={onVoltar}
      className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-dark hover:text-blue transition-colors"
    >
      ← Voltar
    </button>
  );

  // ── Free event: no card form needed ──────────────────────────────────────────
  if (isFree) {
    return (
      <div className="min-h-[80vh] bg-surface2 px-5 py-10">
        <div className="max-w-[560px] mx-auto">
          {backButton}
          <h1 className="font-heading text-[26px] font-black text-blue-dark mb-8">
            Confirmar inscrição
          </h1>

          {orderSummary}

          {erro && (
            <p className="mt-5 text-destructive text-[13px] font-semibold bg-destructive/10 rounded-[10px] px-4 py-3">
              {erro}
            </p>
          )}

          <button
            onClick={confirmar}
            disabled={loading}
            className="mt-5 w-full py-3.5 rounded-[12px] text-[14px] font-extrabold bg-blue text-primary-foreground hover:bg-blue-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Processando..." : "Confirmar inscrição gratuita"}
          </button>
        </div>
      </div>
    );
  }

  // ── Paid event: card form ────────────────────────────────────────────────────
  return (
    <div className="min-h-[80vh] bg-surface2 px-5 py-10">
      <div className="max-w-[820px] mx-auto">
        {backButton}

        <h1 className="font-heading text-[26px] font-black text-blue-dark mb-8">
          Finalizar compra
        </h1>

        <div className="grid grid-cols-[1fr_300px] gap-8 max-md:grid-cols-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormSection title="Dados do cartão">
              <FormField label="Nome no cartão">
                <input
                  required
                  value={nomeCartao}
                  onChange={(e) => setNomeCartao(e.target.value)}
                  placeholder="João da Silva"
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-card text-[13.5px] text-blue-dark font-semibold focus:outline-none focus:border-blue transition-colors"
                />
              </FormField>

              <FormField label="Número do cartão">
                <input
                  required
                  value={numeroCartao}
                  onChange={(e) => setNumeroCartao(maskCardNumber(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-card text-[13.5px] text-blue-dark font-semibold focus:outline-none focus:border-blue transition-colors"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Validade">
                  <input
                    required
                    value={validade}
                    onChange={(e) => setValidade(maskExpiry(e.target.value))}
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-card text-[13.5px] text-blue-dark font-semibold focus:outline-none focus:border-blue transition-colors"
                  />
                </FormField>
                <FormField label="CVV">
                  <input
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-card text-[13.5px] text-blue-dark font-semibold focus:outline-none focus:border-blue transition-colors"
                  />
                </FormField>
              </div>
            </FormSection>

            {erro && (
              <p className="text-destructive text-[13px] font-semibold bg-destructive/10 rounded-[10px] px-4 py-3">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-[12px] text-[14px] font-extrabold bg-blue text-primary-foreground hover:bg-blue-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Processando..." : `Pagar ${formatPrice(total)}`}
            </button>

            <p className="text-center text-[11.5px] text-muted-foreground">
              🔒 Ambiente de demonstração — nenhum valor real será cobrado
            </p>
          </form>

          <aside>{orderSummary}</aside>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-[14px] p-6">
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-5">
        {title}
      </p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[11.5px] font-extrabold text-blue-dark mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-blue-dark">{value}</span>
    </div>
  );
}
