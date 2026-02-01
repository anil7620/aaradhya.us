import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getTokenFromRequest } from '@/lib/auth-helpers'
import { uploadToS3, generateUniqueFilename } from '@/lib/s3'
import { logger, getSafeErrorMessage } from '@/lib/logger'
import { fileTypeFromBuffer } from 'file-type'

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Read file into buffer for magic byte validation
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate file type by magic bytes (actual file content, not spoofed Content-Type)
    const detectedType = await fileTypeFromBuffer(buffer)
    
    // Allowed MIME types for images
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    
    if (!detectedType || !allowedMimeTypes.includes(detectedType.mime)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.' },
        { status: 400 }
      )
    }

    // Also validate Content-Type header matches detected type (defense in depth)
    if (file.type && file.type !== detectedType.mime) {
      logger.warn(`Content-Type mismatch: header=${file.type}, detected=${detectedType.mime}`)
      // Use detected type instead of spoofed header
    }

    // Generate unique filename with correct extension based on detected type
    const extension = detectedType.ext
    const filename = generateUniqueFilename(file.name, extension)

    // Upload to S3 using detected MIME type (not spoofed Content-Type)
    const publicUrl = await uploadToS3(buffer, filename, detectedType.mime)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    logger.error('Error uploading file:', error)
    const errorMessage = getSafeErrorMessage(
      'Failed to upload file',
      error instanceof Error ? error.message : 'Failed to upload file'
    )
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

