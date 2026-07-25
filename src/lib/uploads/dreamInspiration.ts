/** Client helper: upload a Dream Project inspiration image and return its public URL. */
export async function uploadDreamInspiration(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch("/api/uploads/dream-inspiration", {
    method: "POST",
    body,
    credentials: "same-origin",
  });

  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Inspiration upload failed");
  }
  return data.url;
}
