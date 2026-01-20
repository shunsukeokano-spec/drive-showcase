import { getData } from '@/lib/store';
import Card from '@/components/Card';
import Link from 'next/link';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function PhotosPage() {
    const data = await getData();

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 10, display: 'block' }}>← Back Home</Link>
                    <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Photo Gallery</h1>
                </div>
                <Link href="/manage" className="btn-primary">Add Photos</Link>
            </header>

            <div className={styles.gallery}>
                {data.photos.map(photo => (
                    <div key={photo.id} className={styles.galleryItem}>
                        <Card item={photo} />
                    </div>
                ))}
                {data.photos.length === 0 && (
                    <p style={{ color: 'var(--text-secondary)' }}>No photos yet.</p>
                )}
            </div>
        </div>
    );
}
