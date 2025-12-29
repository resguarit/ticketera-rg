import { Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatPrice, formatPriceWithCurrency, formatNumber, formatCurrency } from "@/lib/currencyHelpers"

interface SelectedTicket {
  id: number
  type: string
  price: number
  quantity: number
  description: string
  is_bundle?: boolean
  bundle_quantity?: number
}

interface EventData {
  selectedTickets: SelectedTicket[]
  tax?: number
}

interface OrderSummaryProps {
  eventData: EventData
}

export default function OrderSummary({ eventData }: OrderSummaryProps) {
  const getTotalPrice = () => {
    return eventData.selectedTickets.reduce((total, ticket) => total + ticket.price * ticket.quantity, 0)
  }

  const getTotalTickets = () => {
    return eventData.selectedTickets.reduce((total, ticket) => {
      if (ticket.is_bundle && ticket.bundle_quantity) {
        return total + ticket.quantity * ticket.bundle_quantity
      }
      return total + ticket.quantity
    }, 0)
  }

  const getBundleTicketsCount = () => {
    return eventData.selectedTickets.reduce((total, ticket) => total + ticket.quantity, 0)
  }

  const getServiceFeeDetails = () => {
    const taxRate = eventData.tax ? eventData.tax / 100 : 0
    const fee = getTotalPrice() * taxRate
    return { fee, taxRate }
  }

  const serviceFeeDetails = getServiceFeeDetails()

  const getFinalTotal = () => {
    return getTotalPrice() + serviceFeeDetails.fee
  }

  return (
    <Card className="bg-white border-gray-200 shadow-lg sticky top-24">
      <CardHeader>
        <CardTitle className="text-gray-500 font-medium">Resumen de Compra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {eventData.selectedTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="text-foreground font-semibold">{ticket.type}</h4>
                {ticket.is_bundle && (
                  <Badge variant="secondary" className="text-xs">
                    Pack x{ticket.bundle_quantity}
                  </Badge>
                )}
              </div>
              <p className="text-foreground/60 text-sm">{ticket.description}</p>
              <div className="text-foreground/80 text-sm mt-1">
                {ticket.is_bundle ? (
                  <div>
                    <div>
                      Cantidad: {ticket.quantity} lote{ticket.quantity > 1 ? "s" : ""}
                    </div>
                    <div className="text-blue-600">= {ticket.quantity * (ticket.bundle_quantity || 1)} entradas</div>
                  </div>
                ) : (
                  <div>Cantidad: {ticket.quantity}</div>
                )}
              </div>
            </div>
            <div className="text-right ml-2">
              <p className="text-foreground font-bold">{formatCurrency(ticket.price * ticket.quantity)}</p>
              {ticket.is_bundle ? (
                <p className="text-foreground/60 text-xs">
                  {formatCurrency(ticket.price / (ticket.bundle_quantity || 1), false)} c/u
                </p>
              ) : (
                <p className="text-foreground/60 text-sm">{formatCurrency(ticket.price, false)} c/u</p>
              )}
            </div>
          </div>
        ))}

        <Separator className="bg-gray-200" />

        <div className="space-y-2">
          <div className="flex justify-between text-foreground/80 text-sm">
            <span>
              Subtotal ({getBundleTicketsCount()} {getBundleTicketsCount() === 1 ? "ítem" : "ítems"},{" "}
              {getTotalTickets()} entradas)
            </span>
            <span>{formatPrice(getTotalPrice())}</span>
          </div>
          <div className="flex justify-between text-foreground/80 text-sm">
            <span>Cargo por servicio ({(serviceFeeDetails.taxRate * 100).toFixed(0)}%)</span>
            <span>{formatPrice(serviceFeeDetails.fee)}</span>
          </div>
          <Separator className="bg-gray-200" />
          <div className="flex justify-between text-foreground text-xl font-bold">
            <span>Total</span>
            <span>{formatPriceWithCurrency(getFinalTotal())}</span>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center space-x-2 text-green-600 mb-1">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-semibold">Compra Protegida</span>
          </div>
          <p className="text-foreground/80 text-xs">Tu compra está protegida por nuestra garantía de satisfacción</p>
        </div>
      </CardContent>
    </Card>
  )
}
