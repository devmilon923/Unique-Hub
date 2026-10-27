import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file was provided for upload." },
        { status: 400 }
      );
    }

    // Edge case: empty string or zero-byte file
    if (typeof file === "string" && !file.trim()) {
      return NextResponse.json(
        { success: false, message: "The provided file input is empty." },
        { status: 400 }
      );
    }

    if (file instanceof File) {
      if (file.size === 0) {
        return NextResponse.json(
          { success: false, message: "The uploaded file is empty (0 bytes)." },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, message: "File exceeds the 10MB size limit." },
          { status: 400 }
        );
      }
      if (file.type && !file.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, message: "Only image files (JPEG, PNG, WEBP, AVIF) are allowed." },
          { status: 400 }
        );
      }
    }

    const rawCloudName =
      process.env.Cloud_Name ||
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      "kvxozwaf";
    const rawApiKey =
      process.env.API_Key ||
      process.env.CLOUDINARY_API_KEY ||
      "759884264197838";
    const rawApiSecret =
      process.env.API_Secret ||
      process.env.CLOUDINARY_API_SECRET ||
      "-XdU5JJhBE0ycye7uC1l4I_fH80";

    const cloudName = rawCloudName.trim();
    const apiKey = rawApiKey.trim();
    const apiSecret = rawApiSecret.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Cloudinary credentials are not properly configured.",
        },
        { status: 500 }
      );
    }

    // Prepare upload payload to Cloudinary
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "uniquehub/products";

    // Alphabetical sort of signed parameters (folder, timestamp)
    const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash("sha1")
      .update(stringToSign)
      .digest("hex");

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", String(timestamp));
    cloudinaryFormData.append("folder", folder);
    cloudinaryFormData.append("signature", signature);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const res = await fetch(uploadUrl, {
      method: "POST",
      body: cloudinaryFormData,
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      const errorMsg =
        data.error?.message || `Cloudinary upload failed with status ${res.status}`;
      return NextResponse.json(
        { success: false, message: errorMsg },
        { status: res.status >= 400 && res.status < 600 ? res.status : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.secure_url || data.url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error during upload.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
