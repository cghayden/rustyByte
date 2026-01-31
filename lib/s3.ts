import { S3Client } from '@aws-sdk/client-s3';

// S3 client configuration
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// S3 bucket configuration
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
export const S3_REGION = process.env.AWS_REGION || 'us-east-1';

// File upload configuration
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = [
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/gzip',
  'application/x-tar',

  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',

  // Documents
  'text/plain',
  'application/pdf',
  'application/json',

  // Executables (for reverse engineering challenges)
  'application/octet-stream',
  'application/x-executable',

  // Network captures (various MIME types browsers may report)
  'application/vnd.tcpdump.pcap',
  'application/x-pcapng',
  'application/pcap',
  'application/x-pcap',

  // Other common CTF file types
  'application/x-sqlite3',
] as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

// Generate S3 key (path) for uploaded files
export function generateS3Key(
  categorySlug: string,
  challengeSlug: string,
  originalFilename: string
): string {
  const timestamp = Date.now();
  const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
  // Use category and challenge slug for organized folder structure
  const sanitizedCategory = categorySlug.replace(/[^a-zA-Z0-9-]/g, '_');
  const sanitizedChallenge = challengeSlug.replace(/[^a-zA-Z0-9-]/g, '_');
  return `challenges/${sanitizedCategory}/${sanitizedChallenge}/${timestamp}-${sanitizedFilename}`;
}

// Allowed file extensions (fallback when MIME type is not recognized)
const ALLOWED_EXTENSIONS = [
  '.zip', '.rar', '.7z', '.gz', '.tar', '.tgz',
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.txt', '.pdf', '.json',
  '.exe', '.elf', '.bin', '.so', '.dll',
  '.pcap', '.pcapng', '.cap',
  '.db', '.sqlite', '.sqlite3',
] as const;

// Validate file type and size
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check MIME type first
  const isMimeTypeAllowed = ALLOWED_FILE_TYPES.includes(file.type as AllowedFileType);
  
  // If MIME type is not recognized, check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isExtensionAllowed = ALLOWED_EXTENSIONS.some(ext => fileExtension === ext);

  if (!isMimeTypeAllowed && !isExtensionAllowed) {
    return {
      valid: false,
      error: `File type not allowed. Supported: ZIP, images, executables, PCAP, SQLite, text files`,
    };
  }

  return { valid: true };
}
