import { fakePaymentProvider } from "@/lib/payments/fake-provider";
import type { PaymentProvider } from "@/lib/payments/types";

const providers: Record<string, PaymentProvider> = {
  fake: fakePaymentProvider
};

export function getPaymentProvider(): PaymentProvider {
  const providerName = (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? "fake").toLowerCase();
  return providers[providerName] ?? fakePaymentProvider;
}