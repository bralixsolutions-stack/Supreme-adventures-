// ==========================================================================
// SUPABASE STORAGE HELPER — Uploads image buffers to Supabase Storage
// ==========================================================================
const supabase = require("./supabaseClient");
const crypto = require("crypto");
const path = require("path");

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
const isConfigured = !!supabase;

/**
 * Ensure the storage bucket exists (creates it on first run).
 * Called once at startup.
 */
let bucketReady = false;
async function ensureBucket() {
  if (bucketReady || !supabase) return;
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = (buckets || []).some(b => b.name === BUCKET);
    if (!exists) {
      const { error } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: [
          "image/jpeg", "image/png", "image/webp",
          "image/gif", "image/avif", "image/svg+xml"
        ]
      });
      if (error && !error.message.includes("already exists")) {
        console.error("Failed to create storage bucket:", error.message);
      } else {
        console.log(`📦 Supabase Storage bucket "${BUCKET}" created.`);
      }
    }
    bucketReady = true;
  } catch (err) {
    console.error("Bucket check failed:", err.message);
  }
}

// Run bucket check on load
if (supabase) {
  ensureBucket().then(() => {
    if (bucketReady) console.log(`📦 Supabase Storage ready (bucket: "${BUCKET}").`);
  });
}

/**
 * Upload an image buffer to Supabase Storage.
 * @param {Buffer} buffer       — The raw file buffer (from multer memoryStorage)
 * @param {string} folder       — Storage folder path, e.g. "gallery"
 * @param {string} originalName — Original filename (used to preserve extension)
 * @returns {Promise<string>}   — The public HTTPS URL of the uploaded image
 */
async function uploadToStorage(buffer, folder = "images", originalName = "image.jpg") {
  if (!supabase) {
    throw new Error("Supabase is not configured. Cannot upload to storage.");
  }
  await ensureBucket();

  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const uniqueName = `img-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const filePath = `${folder}/${uniqueName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: getMimeType(ext),
      upsert: false
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Delete an image from Supabase Storage by its public URL.
 * @param {string} url — The public URL of the image
 */
async function deleteFromStorage(url) {
  if (!supabase || !url) return;

  // Only delete Supabase-hosted URLs
  if (!url.includes("supabase.co/storage")) return;

  try {
    // Extract file path from URL like:
    // https://<ref>.supabase.co/storage/v1/object/public/uploads/gallery/img-xxx.jpg
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx < 0) return;

    const filePath = url.substring(idx + marker.length);
    if (!filePath) return;

    const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
    if (error) console.error("Storage deletion failed (non-critical):", error.message);
  } catch (err) {
    console.error("Storage deletion failed (non-critical):", err.message);
  }
}

function getMimeType(ext) {
  const map = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".png": "image/png", ".webp": "image/webp",
    ".gif": "image/gif", ".avif": "image/avif",
    ".svg": "image/svg+xml"
  };
  return map[ext] || "image/jpeg";
}

module.exports = { uploadToStorage, deleteFromStorage, isConfigured };
