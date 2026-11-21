import "server-only";

type DeliveryOk = { ok: true; channel: "whatsapp" | "sms" };
type DeliveryFail = { ok: false; code: string; message: string };
export type Msg91DeliveryResult = DeliveryOk | DeliveryFail;

function msg91AuthKey(): string | undefined {
  const key = process.env.MSG91_AUTH_KEY?.trim();
  return key || undefined;
}

export function isMsg91Configured(): boolean {
  const authkey = msg91AuthKey();
  if (!authkey) return false;
  const whatsapp =
    Boolean(process.env.MSG91_WHATSAPP_NUMBER?.trim()) &&
    Boolean(process.env.MSG91_WHATSAPP_TEMPLATE?.trim());
  const sms = Boolean(process.env.MSG91_OTP_TEMPLATE_ID?.trim());
  return whatsapp || sms;
}

function isWhatsAppConfigured(): boolean {
  return Boolean(
    msg91AuthKey() &&
      process.env.MSG91_WHATSAPP_NUMBER?.trim() &&
      process.env.MSG91_WHATSAPP_TEMPLATE?.trim()
  );
}

function isSmsOtpConfigured(): boolean {
  return Boolean(msg91AuthKey() && process.env.MSG91_OTP_TEMPLATE_ID?.trim());
}

/**
 * Deliver OTP via MSG91 WhatsApp bulk template API.
 * Never log auth keys or the OTP itself.
 */
export async function deliverWhatsAppOtp(
  e164Digits: string,
  code: string
): Promise<Msg91DeliveryResult | null> {
  const authkey = msg91AuthKey();
  const integratedNumber = process.env.MSG91_WHATSAPP_NUMBER?.trim();
  const templateName = process.env.MSG91_WHATSAPP_TEMPLATE?.trim();
  const namespace = process.env.MSG91_WHATSAPP_NAMESPACE?.trim();
  const language = process.env.MSG91_WHATSAPP_LANGUAGE?.trim() || "en";
  if (!authkey || !integratedNumber || !templateName) return null;

  const to = e164Digits.replace(/\D/g, "");
  const payload: Record<string, unknown> = {
    integrated_number: integratedNumber,
    content_type: "template",
    payload: {
      messaging_product: "whatsapp",
      type: "template",
      template: {
        name: templateName,
        language: { code: language, policy: "deterministic" },
        ...(namespace ? { namespace } : {}),
        to_and_components: [
          {
            to: [to],
            components: {
              body_1: { type: "text", value: code },
              button_1: { subtype: "url", type: "text", value: code },
            },
          },
        ],
      },
    },
  };

  try {
    const res = await fetch(
      "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      console.error("[msg91] WhatsApp delivery failed", res.status);
      return {
        ok: false,
        code: "delivery_failed",
        message: "We couldn't send the WhatsApp verification code. Try again shortly.",
      };
    }
    return { ok: true, channel: "whatsapp" };
  } catch {
    console.error("[msg91] WhatsApp delivery request failed");
    return {
      ok: false,
      code: "delivery_failed",
      message: "We couldn't send the WhatsApp verification code. Try again shortly.",
    };
  }
}

/** Optional SMS OTP fallback via MSG91 control API. */
export async function deliverMsg91OtpSms(
  e164Digits: string,
  code: string
): Promise<Msg91DeliveryResult | null> {
  const authkey = msg91AuthKey();
  const templateId = process.env.MSG91_OTP_TEMPLATE_ID?.trim();
  if (!authkey || !templateId) return null;

  const mobile = e164Digits.replace(/\D/g, "");
  const url = new URL("https://control.msg91.com/api/v5/otp");
  url.searchParams.set("template_id", templateId);
  url.searchParams.set("mobile", mobile);
  url.searchParams.set("otp", code);
  url.searchParams.set("otp_length", "6");
  url.searchParams.set("otp_expiry", "5");

  try {
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey,
      },
    });

    if (!res.ok) {
      console.error("[msg91] OTP SMS delivery failed", res.status);
      return {
        ok: false,
        code: "delivery_failed",
        message: "We couldn't send the verification code. Try again shortly.",
      };
    }
    return { ok: true, channel: "sms" };
  } catch {
    console.error("[msg91] OTP SMS delivery request failed");
    return {
      ok: false,
      code: "delivery_failed",
      message: "We couldn't send the verification code. Try again shortly.",
    };
  }
}

/** Prefer WhatsApp; fall back to SMS OTP when configured. */
export async function deliverMobileOtp(
  e164Digits: string,
  code: string
): Promise<Msg91DeliveryResult> {
  if (isWhatsAppConfigured()) {
    const whatsapp = await deliverWhatsAppOtp(e164Digits, code);
    if (whatsapp) return whatsapp;
  }

  if (isSmsOtpConfigured()) {
    const sms = await deliverMsg91OtpSms(e164Digits, code);
    if (sms) return sms;
  }

  return {
    ok: false,
    code: "delivery_unconfigured",
    message: "Mobile verification is temporarily unavailable.",
  };
}
