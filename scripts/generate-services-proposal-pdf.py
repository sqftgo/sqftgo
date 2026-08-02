#!/usr/bin/env python3
"""Generate minimal SqftGo third-party services cost PDF for client."""

from pathlib import Path

from fpdf import FPDF

OUT = Path(__file__).resolve().parents[1] / "docs" / "SqftGo_Third_Party_Services_Proposal.pdf"


class ProposalPDF(FPDF):
    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 8, f"Page {self.page_no()}/{{nb}}", align="C")

    def section_title(self, text):
        self.ln(3)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(140, 70, 45)
        self.cell(0, 8, text, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(200, 160, 140)
        self.line(self.l_margin, self.get_y(), self.l_margin + 36, self.get_y())
        self.ln(3)

    def body(self, text):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 5.2, text)
        self.ln(1)

    def label(self, text):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(40, 40, 40)
        self.cell(0, 6, text, new_x="LMARGIN", new_y="NEXT")

    def callout(self, title, lines):
        self.set_fill_color(252, 245, 240)
        self.set_draw_color(210, 170, 150)
        y0 = self.get_y()
        h = 7 + 5 * len(lines) + 4
        if y0 + h > self.h - self.b_margin:
            self.add_page()
            y0 = self.get_y()
        self.rect(self.l_margin, y0, self.epw, h, style="DF")
        self.set_xy(self.l_margin + 3, y0 + 2)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(140, 70, 45)
        self.cell(0, 5, title, new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 9)
        self.set_text_color(60, 60, 60)
        for line in lines:
            self.set_x(self.l_margin + 3)
            self.cell(self.epw - 6, 5, line, new_x="LMARGIN", new_y="NEXT")
        self.set_y(y0 + h + 4)


def build():
    pdf = ProposalPDF(orientation="P", unit="mm", format="A4")
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.set_margins(16, 16, 16)

    # Cover strip
    pdf.add_page()
    pdf.set_fill_color(140, 70, 45)
    pdf.rect(0, 0, 210, 42, style="F")
    pdf.set_y(12)
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 10, "SqftGo", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 7, "Third-Party Services  |  Cost Overview", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_y(52)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(70, 70, 70)
    pdf.multi_cell(
        0,
        5.5,
        "Three services we need to run SqftGo: KYC verification (Cashfree), SMS/OTP (MSG91), "
        "and email (Amazon SES). Below is where each is used and what it costs at low, "
        "growth, and heavy traffic. Prices are indicative (INR) + GST where applicable.",
    )

    # ── Cashfree ──
    pdf.section_title("1. Cashfree  (KYC Verification)")
    pdf.label("Where used")
    pdf.body(
        "Dealer KYC checks - PAN and bank account verification before listing privileges."
    )
    pdf.callout(
        "Example monthly Cashfree spend (KYC API calls)",
        [
            "Low traffic  -  ~20 to 50 KYC checks:     ~Rs 200 to Rs 500 + GST",
            "Growth       -  ~100 to 200 KYC checks:   ~Rs 1,000 to Rs 2,500 + GST",
            "Heavy        -  ~500+ KYC checks:         ~Rs 5,000 to Rs 10,000 + GST",
        ],
    )

    # ── MSG91 ──
    pdf.section_title("2. MSG91  (SMS / OTP)")
    pdf.label("Where used")
    pdf.body("Mobile OTP for login/signup and important SMS alerts (inquiry, KYC status).")
    pdf.body("One-time DLT / sender setup when going live: ~Rs 5,000 to Rs 6,000.")
    pdf.callout(
        "Example monthly MSG91 spend",
        [
            "Low traffic  -  2,000 OTP/alerts:     ~Rs 300 to Rs 500 + GST",
            "Growth       -  10,000 SMS/month:     ~Rs 1,500 to Rs 2,500 + GST",
            "Heavy        -  50,000 SMS/month:     ~Rs 7,500 to Rs 12,500 + GST",
        ],
    )

    # ── SES ──
    pdf.section_title("3. Amazon SES  (Email)")
    pdf.label("Where used")
    pdf.body(
        "Password reset, email verification, and notification emails to dealers/users."
    )
    pdf.callout(
        "Example monthly Amazon SES spend",
        [
            "Low traffic  -  5,000 emails/month:      ~Rs 40 to Rs 50",
            "Growth       -  50,000 emails/month:     ~Rs 400 to Rs 450",
            "Heavy        -  200,000 emails/month:    ~Rs 1,600 to Rs 1,800",
        ],
    )

    # Combined
    pdf.section_title("Combined monthly (all three)")
    pdf.callout(
        "Rough total by stage",
        [
            "Low traffic:   ~Rs 540 to Rs 1,050 + GST",
            "Growth:        ~Rs 2,900 to Rs 5,450 + GST",
            "Heavy:         ~Rs 14,000 to Rs 24,000+ + GST",
            "(MSG91 one-time DLT is separate, not included above.)",
        ],
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
