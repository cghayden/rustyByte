import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import {
  s3Client,
  S3_BUCKET_NAME,
  generateS3Key,
  validateFile,
} from '@/lib/s3';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const challengeId = formData.get('challengeId') as string;
    const displayName = (formData.get('displayName') as string) || file.name;
    const description = (formData.get('description') as string) || null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    // Fetch challenge to get the slug and category
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { 
        slug: true,
        category: {
          select: { id: true }
        }
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate S3 key using category and challenge slug
    const s3Key = generateS3Key(challenge.category.id, challenge.slug, file.name);
    console.log(`Uploading file to S3: ${s3Key} in bucket: ${S3_BUCKET_NAME}`);

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: file.type,
      ContentDisposition: `attachment; filename="${file.name}"`,
      Metadata: {
        originalName: file.name,
        uploadedBy: 'ctf-admin', // TODO: Add user authentication
        challengeId: challengeId,
      },
    });

    let s3Response;
    try {
      s3Response = await s3Client.send(uploadCommand);
      console.log('S3 upload successful:', s3Response);
      
      // Verify the upload succeeded
      if (!s3Response || s3Response.$metadata.httpStatusCode !== 200) {
        throw new Error(`S3 upload failed with status: ${s3Response.$metadata.httpStatusCode}`);
      }
    } catch (s3Error) {
      console.error('S3 upload failed:', s3Error);
      throw new Error(`Failed to upload to S3: ${s3Error instanceof Error ? s3Error.message : 'Unknown error'}`);
    }

    // Only save to database if S3 upload succeeded
    const challengeFile = await prisma.challengeFile.create({
      data: {
        name: displayName,
        filename: file.name,
        description,
        challenge: {
          connect: { id: challengeId },
        },
        // Store S3 path for future reference
        filePath: s3Key,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: challengeFile.id,
        name: challengeFile.name,
        filename: challengeFile.filename,
        size: challengeFile.fileSize,
        s3Key: s3Key,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to upload file', details: errorMessage },
      { status: 500 }
    );
  }
}

// Get file download URL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get file metadata from database
    const challengeFile = await prisma.challengeFile.findUnique({
      where: { id: parseInt(fileId) },
    });

    if (!challengeFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Generate signed URL for download
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: challengeFile.filePath || '',
      ResponseContentDisposition: `attachment; filename="${challengeFile.filename}"`,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    }); // 1 hour

    return NextResponse.json({
      downloadUrl: signedUrl,
      filename: challengeFile.filename,
      size: challengeFile.fileSize,
    });
  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}

// Delete file from both S3 and database
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get file metadata from database first
    const challengeFile = await prisma.challengeFile.findUnique({
      where: { id: parseInt(fileId) },
    });

    if (!challengeFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from S3 first
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: challengeFile.filePath || '',
    });

    try {
      const s3Response = await s3Client.send(deleteCommand);
      console.log('S3 deletion successful:', s3Response);
      
      // Verify deletion (S3 returns 204 for successful deletion)
      if (s3Response.$metadata.httpStatusCode !== 204 && s3Response.$metadata.httpStatusCode !== 200) {
        throw new Error(`S3 deletion failed with status: ${s3Response.$metadata.httpStatusCode}`);
      }
    } catch (s3Error) {
      console.error('S3 deletion failed:', s3Error);
      throw new Error(`Failed to delete from S3: ${s3Error instanceof Error ? s3Error.message : 'Unknown error'}`);
    }

    // Only delete from database after S3 deletion is confirmed
    await prisma.challengeFile.delete({
      where: { id: parseInt(fileId) },
    });

    console.log(`File deleted successfully: ${challengeFile.filename}`);
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('File deletion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete file', details: errorMessage },
      { status: 500 }
    );
  }
}
