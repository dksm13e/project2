import { getPaymentProvider } from "@/lib/payments/provider";
import type { CheckoutPaymentOutcome, PaymentConfirmation, PaymentSessionInput } from "@/lib/payments/types";

export async function runCheckoutPayment(input: PaymentSessionInput): Promise<CheckoutPaymentOutcome> {
  const provider = getPaymentProvider();
  const session = await provider.createSession(input);

  const confirmation: PaymentConfirmation = {
    sessionId: session.sessionId,
    paymentMethod: "card"
  };

  const result = await provider.confirmSession(session, confirmation);

  return {
    providerName: provider.name,
    session,
    result
  };
}