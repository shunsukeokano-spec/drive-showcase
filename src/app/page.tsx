import { getData } from '@/lib/store';
import Card from '@/components/Card';
import Link from 'next/link';
import styles from './page.module.css';

export const dynamic = 'force-dynamic'; // Ensure we get fresh data

export default async function Home() {
  const data = await getData();
  const recentDocs = data.docs.slice(0, 4);

  return (
    <main className="container">
      <header className={styles.hero}>
        <h1>The Drive Collection</h1>
        <p>A curated showcase of documents and memories.</p>
        <Link href="/manage" className="btn-primary" style={{ marginTop: 20 }}>
          Manage Content
        </Link>
      </header>

      {/* Docs Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recent Documents</h2>
        </div>
        <div className={styles.grid}>
          {recentDocs.length > 0 ? (
            recentDocs.map(doc => <Card key={doc.id} item={doc} />)
          ) : (
            <p className={styles.empty}>No documents yet. Add one via Manage.</p>
          )}
        </div>
      </section>

      {/* Photos Preview Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recent Photos</h2>
          <Link href="/photos" className={styles.viewAll}>View Gallery →</Link>
        </div>
        <div className={styles.photoGrid}>
          {data.photos.slice(0, 6).map(photo => (
            <Card key={photo.id} item={photo} />
          ))}
          {data.photos.length === 0 && (
            <p className={styles.empty}>No photos yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
