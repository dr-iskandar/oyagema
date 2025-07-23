import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';

// Note: In App Router, the config for bodyParser and responseLimit
// should be set in next.config.js instead of here

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check if file is an audio or image file
    if (!file.type.includes('audio') && !file.type.includes('image')) {
      return NextResponse.json(
        { error: 'File must be an audio or image file' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate a unique filename with original extension
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const fileName = `${uuidv4()}.${extension}`;
    
    // Define the path where the file will be saved
    // In a real production app, you would use a cloud storage service
    const publicDir = join(process.cwd(), 'public');
    const uploadsDir = join(publicDir, 'uploads');
    const filePath = join(uploadsDir, fileName);
    
    // Ensure the uploads directory exists
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      console.error('Error saving file:', error);
      return NextResponse.json(
        { error: 'Failed to save file' },
        { status: 500 }
      );
    }
    
    // Return the URL to the uploaded file
    const fileUrl = `/uploads/${fileName}`;
    
    // Run post-asset script to copy the file to standalone output
    try {
      exec('npm run post-asset:sh', (error, stdout, stderr) => {
        if (error) {
          console.error('Error running post-asset script:', error);
          return;
        }
        console.log('Post-asset script output:', stdout);
        if (stderr) {
          console.error('Post-asset script stderr:', stderr);
        }
      });
    } catch (scriptError) {
      console.error('Failed to execute post-asset script:', scriptError);
      // Continue anyway, as the file is already saved to public/uploads
    }
    
    return NextResponse.json({ 
      url: fileUrl,
      message: 'File uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}