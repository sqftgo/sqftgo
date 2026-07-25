/** Client helper: upload a property image via the BFF and return its public URL. */
export async function uploadPropertyImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch("/api/uploads/property-image", {
    method: "POST",
    body,
    credentials: "same-origin",
  });

  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Image upload failed");
  }
  return data.url;
}
