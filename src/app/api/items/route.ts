import { NextRequest, NextResponse } from 'next/server';
import { addDoc } from '@/lib/store';

export async function POST(request: NextRequest) {
    try {
        const { url, title } = await request.json();

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ success: false, error: 'Invalid URL' }, { status: 400 });
        }

        // Basic validation
        if (!url.includes('docs.google.com')) {
            return NextResponse.json({ success: false, error: 'Not a Google Doc URL' }, { status: 400 });
        }

        const newItem = await addDoc(url, title);
        return NextResponse.json({ success: true, item: newItem });

    } catch (error) {
        console.error('Add doc error:', error);
        return NextResponse.json({ success: false, error: 'Failed to add doc' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { id, type, title } = await request.json();
        if (!id || !title || !type) return NextResponse.json({ success: false }, { status: 400 });

        const { updateItemTitle } = await import('@/lib/store');
        const success = await updateItemTitle(id, type, title);

        return NextResponse.json({ success });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const type = searchParams.get('type') as 'doc' | 'photo';

        if (!id || !type) return NextResponse.json({ success: false }, { status: 400 });

        const { deleteItem } = await import('@/lib/store');
        const success = await deleteItem(id, type);

        return NextResponse.json({ success });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
    }
}
