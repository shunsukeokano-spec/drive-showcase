import { getData } from '@/lib/store';
import Link from 'next/link';
import styles from './page.module.css';

type Props = {
    params: Promise<{ id: string }>
}

export default async function DocPage({ params }: Props) {
    const { id } = await params;
    const data = await getData();
    const doc = data.docs.find(d => d.id === id);

    if (!doc) {
        return <div className="container" style={{ padding: 40 }}>Document not found</div>;
    }

    // Convert "share" link to "embed" link
    // e.g. https://docs.google.com/document/d/DOC_ID/edit?usp=sharing -> https://docs.google.com/document/d/DOC_ID/preview
    let embedUrl = doc.url;
    try {
        const urlObj = new URL(doc.url);
        // Simple replacement strategy
        if (urlObj.pathname.includes('/edit') || urlObj.pathname.includes('/view')) {
            embedUrl = doc.url.replace(/\/edit.*$/, '/preview').replace(/\/view.*$/, '/preview');
        } else if (!doc.url.endsWith('/preview')) {
            embedUrl = `${doc.url}/preview`;
        }
    } catch (e) {
        console.error("Error parsing URL", e);
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>← Back to Collection</Link>
                <h1>{doc.title}</h1>
            </header>

            <div className={`${styles.frameWrapper} glass-panel`}>
                <iframe
                    src={embedUrl}
                    className={styles.iframe}
                    allowFullScreen
                />
            </div>
        </div>
    );
}
