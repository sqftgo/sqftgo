# SqftGo — Third-Party Services Cost Overview

**PDF:** [SqftGo_Third_Party_Services_Proposal.pdf](./SqftGo_Third_Party_Services_Proposal.pdf)  
Regenerate: `python scripts/generate-services-proposal-pdf.py`

Three services. Indicative INR costs (+ GST where applicable).

---

## 1. Cashfree (KYC Verification)

**Where used:** Dealer KYC — PAN and bank account verification before listing privileges.

| Stage | Example volume | Monthly cost |
|-------|----------------|--------------|
| Low traffic | ~20–50 KYC checks | ~₹200–500 + GST |
| Growth | ~100–200 KYC checks | ~₹1,000–2,500 + GST |
| Heavy | ~500+ KYC checks | ~₹5,000–10,000 + GST |

---

## 2. MSG91 (SMS / OTP)

**Where used:** Mobile OTP and important SMS alerts.  
**One-time:** DLT / sender setup ~₹5,000–6,000.

| Stage | Volume | Monthly cost |
|-------|--------|--------------|
| Low traffic | 2,000 OTP/alerts | ~₹300–500 + GST |
| Growth | 10,000 SMS/month | ~₹1,500–2,500 + GST |
| Heavy | 50,000 SMS/month | ~₹7,500–12,500 + GST |

---

## 3. Amazon SES (Email)

**Where used:** Password reset, verification, notification emails.

| Stage | Volume | Monthly cost |
|-------|--------|--------------|
| Low traffic | 5,000 emails/month | ~₹40–50 |
| Growth | 50,000 emails/month | ~₹400–450 |
| Heavy | 200,000 emails/month | ~₹1,600–1,800 |

---

## Combined monthly (all three)

| Stage | Rough total |
|-------|-------------|
| Low traffic | ~₹540–1,050 + GST |
| Growth | ~₹2,900–5,450 + GST |
| Heavy | ~₹14,000–24,000+ + GST |

MSG91 DLT one-time fee not included in monthly totals.
