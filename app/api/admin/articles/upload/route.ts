import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const BUCKET = "article-images";
const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** POST multipart/form-data { file } → { url } (public Supabase Storage URL). */
export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized: Admin session required" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 });
    }

    const extension = EXTENSIONS[file.type];
    if (!extension) {
      return NextResponse.json({ success: false, error: "Only JPG, PNG, WebP or GIF images are allowed." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "Image must be 5 MB or smaller." }, { status: 400 });
    }

    const month = new Date().toISOString().slice(0, 7);
    const path = `${month}/${Date.now()}-${randomBytes(6).toString("hex")}.${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseServer.storage.from(BUCKET).upload(path, bytes, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw error;

    const { data } = supabaseServer.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ success: true, url: data?.publicUrl ?? "" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[admin/articles/upload] failed:", message);
    return NextResponse.json(
      { success: false, error: `Upload failed: ${message}. Make sure the article-images bucket migration has been run.` },
      { status: 500 },
    );
  }
}
