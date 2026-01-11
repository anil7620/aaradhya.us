import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'arushii-in-production'

/**
 * Upload a file to S3
 * @param file - The file buffer
 * @param filename - The filename to use in S3
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToS3(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  try {
    const key = `products/${filename}`

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      // Note: ACL is not used as the bucket has ACLs disabled
      // Public access is controlled via bucket policy instead
    })

    await s3Client.send(command)

    // Return the public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`
    return publicUrl
  } catch (error: any) {
    console.error('Error uploading to S3:', error)
    
    // Provide more specific error messages
    if (error.Code === 'AccessControlListNotSupported') {
      throw new Error('S3 bucket has ACLs disabled. Please configure bucket policy for public read access.')
    }
    if (error.Code === 'AccessDenied') {
      throw new Error('Access denied. Check your AWS credentials and bucket permissions.')
    }
    if (error.Code === 'NoSuchBucket') {
      throw new Error(`S3 bucket "${BUCKET_NAME}" does not exist.`)
    }
    
    throw new Error(error.message || 'Failed to upload file to S3')
  }
}

/**
 * Generate a unique filename for uploads
 * @param originalFilename - The original filename
 * @returns A unique filename with timestamp
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const sanitizedName = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const extension = sanitizedName.split('.').pop() || 'jpg'
  return `${timestamp}-${Math.random().toString(36).substring(2, 9)}.${extension}`
}
