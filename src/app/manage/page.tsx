import AdminClient from './AdminClient';
import ContentList from './ContentList';
import { getData } from '@/lib/store';
import styles from '../page.module.css';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ManagePage() {
    const data = await getData();

    return (
        <div className="container" style={{ padding: '40px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <header style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
                <Link href="/" style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'color 0.2s'
                }}>
                    ← Back to Home
                </Link>
                <h1 style={{ fontSize: '3rem', background: 'linear-gradient(to right, #fff, #a4b0be)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Content Manager
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Add Docs and Photos easily.</p>
            </header>

            <AdminClient />

            {/* List Implementation */}
            <ContentList initialDocs={data.docs} initialPhotos={data.photos} />
        </div>
    );
}
