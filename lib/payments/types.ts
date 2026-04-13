import type { ScenarioId } from "@/lib/scenarios";

export type PaymentCurrency = "RUB";

export type PaymentSessionStatus = "requires_confirmation" | "processing" | "succeeded" | "failed";

export type PaymentSessionInput = {
  scenarioId: ScenarioId;
  draftId: string;
  amountRub: number;
  currency: PaymentCurrency;
  description: string;
  metadata?: Record<string, string>;
};

export type PaymentSession = {
  sessionId: string;
  provider: string;
  amountRub: number;
  currency: PaymentCurrency;
  status: PaymentSessionStatus;
  createdAt: string;
  displayPrice: string;
};

export type PaymentConfirmation = {
  sessionId: string;
  paymentMethod: "card";
};

export type PaymentResult = {
  status: "succeeded" | "failed";
  providerTransactionId?: string;
  errorMessage?: string;
};

export interface PaymentProvider {
  name: string;
  createSession(input: PaymentSessionInput): Promise<PaymentSession>;
  confirmSession(session: PaymentSession, confirmation: PaymentConfirmation): Promise<PaymentResult>;
}

export type CheckoutPaymentOutcome = {
  providerName: string;
  session: PaymentSession;
  result: PaymentResult;
};
