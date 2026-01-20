import Link from 'next/link';
import Image from 'next/image';
import { DocItem, PhotoItem } from '@/lib/store';
import styles from './Card.module.css';

type CardProps = {
    item: DocItem | PhotoItem;
};

export default function Card({ item }: CardProps) {
    if (item.type === 'doc') {
        return (
            <Link href={`/doc/${item.id}`} className={`${styles.card} glass-panel`}>
                <div className={styles.iconWrapper}>📄</div>
                <div className={styles.content}>
                    <h3>{item.title}</h3>
                    <p className={styles.date}>Added: {new Date(item.addedAt).toLocaleDateString()}</p>
                </div>
            </Link>
        );
    }

    return (
        <div className={`${styles.card} glass-panel`}>
            <div className={styles.imageWrapper}>
                {/* Using standard img for local uploads if Next/Image config is tricky for dynamic paths without config, 
            but standard Image is better. We'll assume simple path works. */}
                <img src={item.url} alt={item.title} className={styles.image} loading="lazy" />
            </div>
            <div className={styles.contentOverlay}>
                <h3>{item.title}</h3>
            </div>
        </div>
    );
}
