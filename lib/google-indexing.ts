import crypto from "crypto";

export interface GoogleIndexResult {
  url: string;
  success: boolean;
  status?: number;
  data?: unknown;
  error?: string;
}

/**
 * Creates a base64url encoded string
 */
const base64UrlEncode = (str: string | Buffer): string => {
  const base64 = Buffer.isBuffer(str) ? str.toString("base64") : Buffer.from(str).toString("base64");
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

/**
 * Retrieves a Google OAuth2 Access Token using RS256 Service Account JWT
 */
const getGoogleAccessToken = async (
  clientEmail: string,
  privateKey: string
): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const claimSet = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

  // Clean private key formatting (convert literal \n to real newlines)
  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signatureInput);
  signer.end();
  const signature = signer.sign(formattedPrivateKey);
  const encodedSignature = base64UrlEncode(signature);

  const jwt = `${signatureInput}.${encodedSignature}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`Google OAuth Token Error (${tokenResponse.status}): ${errText}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
};

/**
 * Sends a URL directly to Google Indexing API (URL_UPDATED)
 */
export const submitUrlToGoogleIndexingAPI = async (
  url: string,
  accessToken: string
): Promise<GoogleIndexResult> => {
  try {
    const response = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url,
        type: "URL_UPDATED",
      }),
    });

    const data = await response.json().catch(() => ({}));

    return {
      url,
      success: response.ok,
      status: response.status,
      data,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      url,
      success: false,
      error: msg,
    };
  }
};

/**
 * PubSubHubbub / WebSub Push to Google's real-time RSS Feed Hub
 * Googlebot uses this hub to subscribe to feed changes instantly!
 */
export const pingGoogleWebSub = async (
  feedUrl: string = "https://www.keralalotteryresultstoday.in/feed.xml"
): Promise<{ success: boolean; status?: number; error?: string }> => {
  try {
    const params = new URLSearchParams();
    params.append("hub.mode", "publish");
    params.append("hub.url", feedUrl);

    const res = await fetch("https://pubsubhubbub.appspot.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    return {
      success: res.status >= 200 && res.status < 300,
      status: res.status,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: msg,
    };
  }
};

/**
 * Ping Google's Sitemap Ping Endpoint
 */
export const pingGoogleSitemap = async (
  sitemapUrl: string = "https://www.keralalotteryresultstoday.in/sitemap.xml"
): Promise<{ success: boolean; status?: number; error?: string }> => {
  try {
    const res = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    return {
      success: res.ok,
      status: res.status,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: msg,
    };
  }
};

/**
 * High-Level Multi-Channel Google Indexing Runner
 */
export const submitUrlsToGoogle = async (urls: string[]): Promise<{
  webSub: { success: boolean; status?: number; error?: string };
  sitemapPing: { success: boolean; status?: number; error?: string };
  indexingApi: {
    configured: boolean;
    results: GoogleIndexResult[];
    error?: string;
  };
}> => {
  // 1. Trigger Google WebSub RSS Hub Push
  const webSub = await pingGoogleWebSub();

  // 2. Trigger Google Sitemap Ping
  const sitemapPing = await pingGoogleSitemap();

  // 3. Trigger Google Indexing API if Service Account keys are set in ENV
  let clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";
  let privateKey = process.env.GOOGLE_PRIVATE_KEY ?? "";

  // Check if raw JSON was provided
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson && (!clientEmail || !privateKey)) {
    try {
      const parsed = JSON.parse(serviceAccountJson);
      clientEmail = parsed.client_email ?? "";
      privateKey = parsed.private_key ?? "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", msg);
    }
  }

  const indexingApiResults: GoogleIndexResult[] = [];
  let indexingApiConfigured = false;
  let indexingApiError: string | undefined;

  if (clientEmail && privateKey) {
    indexingApiConfigured = true;
    try {
      const accessToken = await getGoogleAccessToken(clientEmail, privateKey);
      for (const url of urls) {
        const res = await submitUrlToGoogleIndexingAPI(url, accessToken);
        indexingApiResults.push(res);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      indexingApiError = msg;
      console.warn("[Google Indexing API Error]:", msg);
    }
  }

  return {
    webSub,
    sitemapPing,
    indexingApi: {
      configured: indexingApiConfigured,
      results: indexingApiResults,
      error: indexingApiError,
    },
  };
};
