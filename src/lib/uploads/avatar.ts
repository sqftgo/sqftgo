/** Client helper: upload a profile avatar via the BFF and return its public URL. */
export async function uploadAvatar(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch("/api/uploads/avatar", {
    method: "POST",
    body,
    credentials: "same-origin",
  });

  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Avatar upload failed");
  }
  return data.url;
}
