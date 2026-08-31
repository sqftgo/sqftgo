import { z } from "zod";

export const createSubscriptionOrderSchema = z.object({
  planId: z.enum(["starter", "professional", "enterprise"]),
});

export const verifySubscriptionPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
