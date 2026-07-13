export interface GooglePayResponseDetails {
  paymentMethodData?: {
    info?: {
      cardNetwork?: string;
      cardDetails?: string;
    };
    tokenizationData?: {
      token?: string;
    };
  };
}

const TOKEN_HEAD = 30;
const TOKEN_TAIL = 10;

export function maskToken(token: string): string {
  if (token.length <= TOKEN_HEAD + TOKEN_TAIL + 1) {
    return token;
  }
  return `${token.slice(0, TOKEN_HEAD)}…${token.slice(-TOKEN_TAIL)}`;
}

export function describeSuccess(methodName: string, details: unknown): string {
  const paymentMethodData = (details as GooglePayResponseDetails | undefined)?.paymentMethodData;
  const cardNetwork = paymentMethodData?.info?.cardNetwork;
  const cardDetails = paymentMethodData?.info?.cardDetails;
  const token = paymentMethodData?.tokenizationData?.token;

  if (cardNetwork && cardDetails && token) {
    return `Payment authorized via Google Pay (TEST) — ${cardNetwork} •••• ${cardDetails}\nToken: ${maskToken(token)}`;
  }

  return `Payment completed via "${methodName}".`;
}
