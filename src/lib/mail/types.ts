export type MailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
};

export type MailSendResult = {
  ok: boolean;
  provider?: "resend" | "mailjet" | "msg91";
  error?: string;
  skipped?: boolean;
};
