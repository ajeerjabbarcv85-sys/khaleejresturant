import { NextRequest } from "next/server";
import { fail, ok, requireAdmin } from "@/lib/api-helpers";
import { saveDataUrl } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  try {
    const body = (await request.json()) as { imageData?: string; dataUrl?: string };
    const url = saveDataUrl(String(body.imageData || body.dataUrl || ""));
    if (!url) return fail("Upload a JPG, PNG, WEBP or SVG image under 5 MB");
    return ok({ url }, "Image uploaded");
  } catch {
    return fail("Unable to upload image");
  }
}
