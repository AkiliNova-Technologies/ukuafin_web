const PESAPAL_BASE_URL = process.env.NODE_ENV === "production"
  ? "https://pay.pesapal.com/v3/api"
  : "https://cybqa.pesapal.com/pesapalv3/api";

export interface PesapalBillingAddress {
  email_address: string;
  phone_number: string;
  country_code: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  line_1: string;
  line_2: string;
  city: string;
  state: string;
  postal_code: string;
  zip_code: string;
}

export interface SubmitOrderPayload {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  redirect_mode?: "TOP_WINDOW" | "PARENT_WINDOW" | "";
  notification_id: string;
  branch?: string;
  billing_address: PesapalBillingAddress;
}

export interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  // FIXED: Changed error tracking flag structure from 'any' to 'unknown'
  error: unknown;
  status: string;
}

// Global in-memory token cache (wipes cleanly on serverless container spins)
let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

/**
 * Retrieves a valid Pesapal auth token. Uses memory cache if active,
 * or fetches a brand new one synchronously if expired.
 */
export async function getPesapalAuthToken(): Promise<string> {
  const now = Date.now();

  // If token exists and is valid for at least another 30 seconds, return it
  if (cachedToken && tokenExpiresAt && now < (tokenExpiresAt - 30000)) {
    return cachedToken;
  }

  const key = process.env.PESAPAL_CONSUMER_KEY;
  const secret = process.env.PESAPAL_CONSUMER_SECRET;

  if (!key || !secret) {
    throw new Error("Missing credentials: PESAPAL_CONSUMER_KEY or PESAPAL_CONSUMER_SECRET");
  }

  const response = await fetch(`${PESAPAL_BASE_URL}/Auth/RequestToken`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ consumer_key: key, consumer_secret: secret }),
    cache: "no-store", 
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`Pesapal Authentication Failed (HTTP Error): ${errData.message || response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.token) {
    console.error("❌ PESAPAL AUTHENTICATION FAILURE RAW PAYLOAD:", data);
    
    const extractError = data.error?.message || data.message || JSON.stringify(data);
    throw new Error(`Pesapal authentication response did not return a valid token string. Reason from Gateway: "${extractError}"`);
  }

  cachedToken = data.token;
  
  if (data.expiryDate) {
    tokenExpiresAt = new Date(data.expiryDate).getTime();
  } else {
    tokenExpiresAt = Date.now() + 5 * 60 * 1000; 
  }

  return data.token; 
}

export async function submitPesapalOrder(payload: SubmitOrderPayload): Promise<PesapalOrderResponse> {
  const token = await getPesapalAuthToken();

  const response = await fetch(`${PESAPAL_BASE_URL}/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: payload.id,
      currency: payload.currency,
      amount: payload.amount,
      description: payload.description,
      redirect_mode: payload.redirect_mode || "TOP_WINDOW",
      callback_url: payload.callback_url,
      notification_id: payload.notification_id,
      branch: payload.branch || "",
      billing_address: payload.billing_address,
    }),
  });

  // Handle true HTTP network errors (4xx, 5xx)
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error?.message || errorBody?.message || "Unknown error";
    throw new Error(`Pesapal Order Submission Refused (HTTP ${response.status}): ${message}`);
  }

  const data = await response.json();

  // Catch internal API failures hidden inside an HTTP 200 response
  if (!data.redirect_url) {
    console.error("❌ PESAPAL ORDER REJECTION CODES:", {
      status: data.status,
      errorType: data.error?.error_type,
      errorCode: data.error?.code,
      errorMessage: data.error?.message,
      fullPayload: data
    });
    
    const extraction = data.error?.message || data.error?.code || "Invalid configuration params";
    throw new Error(`Pesapal rejected order creation: "${extraction}"`);
  }

  return data;
}

export async function verifyPesapalTransaction(orderTrackingId: string) {
  const token = await getPesapalAuthToken();

  const response = await fetch(
    `${PESAPAL_BASE_URL}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to query transaction status for Tracking ID: ${orderTrackingId}`);
  }

  return response.json();
}

export async function cancelPesapalOrder(orderTrackingId: string) {
  const token = await getPesapalAuthToken();
  const response = await fetch(`${PESAPAL_BASE_URL}/Transactions/CancelOrder`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ order_tracking_id: orderTrackingId }),
  });
  return response.json();
}

export async function requestPesapalRefund(payload: {
  confirmation_code: string;
  amount: number;
  username: string;
  remarks: string;
}) {
  const token = await getPesapalAuthToken();
  const response = await fetch(`${PESAPAL_BASE_URL}/Transactions/RefundRequest`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      confirmation_code: payload.confirmation_code,
      amount: payload.amount, 
      username: payload.username,
      remarks: payload.remarks
    }),
  });
  return response.json();
}