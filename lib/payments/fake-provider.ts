import type { PaymentProvider, PaymentResult, PaymentSession, PaymentSessionInput } from "@/lib/payments/types";

function makeId(prefix: string) {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${stamp}_${rand}`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toDisplayPrice(amountRub: number) {
  return `${amountRub.toLocaleString("ru-RU")} RUB`;
}

export const fakePaymentProvider: PaymentProvider = {
  name: "fake",

  async createSession(input: PaymentSessionInput): Promise<PaymentSession> {
    await delay(260);

    return {
      sessionId: makeId("pay_session"),
      provider: "fake",
      amountRub: input.amountRub,
      currency: input.currency,
      status: "requires_confirmation",
      createdAt: new Date().toISOString(),
      displayPrice: toDisplayPrice(input.amountRub)
    };
  },

  async confirmSession(): Promise<PaymentResult> {
    await delay(880);

    return {
      status: "succeeded",
      providerTransactionId: makeId("fake_tx")
    };
  }
};