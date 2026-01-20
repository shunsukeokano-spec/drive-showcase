import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { addPhoto } from '@/lib/store';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        // Upload directly to Vercel Blob
        const blob = await put(file.name, file, {
            access: 'public',
        });

        // Add to our JSON DB
        const newItem = await addPhoto(blob.url, file.name);

        return NextResponse.json({ success: true, item: newItem });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }
}
