"use client";

import { useCallback, useEffect, useState } from "react";
import { handleClientError } from "@/lib/errors/handle-client-error";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, Button, Alert } from "@/components/ui";
import { OtpCodeInput } from "@/components/auth/OtpCodeInput";
import { MobilePhoneField, mobileFieldError } from "@/components/auth/MobilePhoneField";
import { authService } from "@/services/auth";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";

type Step = "phone" | "otp";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ServiceProviderLoginModal({ open, onClose }: Props) {
  const router = useRouter();
  const { loginServiceProviderWithMobile } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [countryCode, setCountryCode] = useState("91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [channel, setChannel] = useState<"whatsapp" | "sms" | "dev" | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("phone");
      setOtpCode("");
      setError(null);
      setSuccess(null);
      setDebugCode(null);
      setChannel(null);
      setResendIn(0);
      setBusy(false);
    }
  }, [open]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  const sendOtp = useCallback(async () => {
    const phoneErr = mobileFieldError(countryCode, mobileNumber);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const sent = await authService.sendMobileOtp({
        purpose: "login",
        countryCode,
        mobileNumber,
      });
      setResendIn(sent.resendAfterSeconds);
      setChannel(sent.channel);
      setDebugCode(sent.debugCode ?? null);
      setOtpCode(sent.debugCode ?? "");
      setStep("otp");
      setSuccess(
        sent.channel === "dev"
          ? "Dev mode: use the code shown below."
          : sent.channel === "sms"
            ? "We sent a login code by SMS."
            : "We sent a login code on WhatsApp."
      );
    } catch (err) {
      handleClientError(err, { fallback: "Couldn't send a code." });
    } finally {
      setBusy(false);
    }
  }, [countryCode, mobileNumber]);

  const verify = useCallback(async () => {
    if (!/^[0-9]{6}$/.test(otpCode.trim())) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await loginServiceProviderWithMobile({
        countryCode,
        mobileNumber,
        code: otpCode.trim(),
      });
      onClose();
      router.push("/services/manage");
    } catch (err) {
      if (err instanceof ApiError && err.code === "unregistered_provider") {
        setError(
          "No service business is registered with this mobile number. Register your business to continue."
        );
      } else {
        handleClientError(err, { fallback: "Couldn't verify that code." });
      }
    } finally {
      setBusy(false);
    }
  }, [
    countryCode,
    mobileNumber,
    otpCode,
    loginServiceProviderWithMobile,
    onClose,
    router,
  ]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Welcome Back, Service Provider"
      description="Sign in with the mobile number linked to your registered business. We’ll send a one-time code via WhatsApp or SMS."
      className="max-w-lg"
      footer={
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-end">
          {step === "otp" ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStep("phone");
                setError(null);
                setSuccess(null);
              }}
              disabled={busy}
            >
              Change number
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={() => void (step === "phone" ? sendOtp() : verify())}
            loading={busy}
          >
            {step === "phone" ? "Send OTP" : "Verify & continue"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error ? <Alert variant="danger" title="Unable to continue" description={error} /> : null}
        {success ? <Alert variant="success" title="Code sent" description={success} /> : null}

        {step === "phone" ? (
          <MobilePhoneField
            countryCode={countryCode}
            mobileNumber={mobileNumber}
            onCountryChange={setCountryCode}
            onMobileChange={setMobileNumber}
            disabled={busy}
          />
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-charcoal/70">
              Enter the 6-digit code sent to +{countryCode} {mobileNumber}
              {channel ? ` via ${channel === "dev" ? "dev console" : channel}` : ""}.
            </p>
            <OtpCodeInput value={otpCode} onChange={setOtpCode} disabled={busy} />
            {debugCode ? (
              <p className="text-xs font-mono text-charcoal/50">Dev code: {debugCode}</p>
            ) : null}
            <button
              type="button"
              className="text-xs font-bold text-indigo disabled:opacity-40"
              disabled={busy || resendIn > 0}
              onClick={() => void sendOtp()}
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-sand space-y-2 text-sm font-semibold text-charcoal/65">
          <p>
            New to SqftGo services?{" "}
            <Link
              href="/services/register"
              className="text-terracotta font-black"
              onClick={onClose}
            >
              Register your business
            </Link>
          </p>
          <p>
            Need help accessing your account?{" "}
            <a href="mailto:support@sqftgo.com" className="text-indigo font-black">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </Dialog>
  );
}
