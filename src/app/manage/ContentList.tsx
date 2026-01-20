'use client';
import { useState } from 'react';
import styles from './Manage.module.css';

type Item = {
    id: string;
    title: string;
    type: 'doc' | 'photo';
    url: string;
};

export default function ContentList({ initialDocs, initialPhotos }: { initialDocs: Item[], initialPhotos: Item[] }) {
    // Combine for easier management list
    const [items, setItems] = useState<Item[]>([...initialDocs, ...initialPhotos]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.size} items?`)) return;

        // Process in parallel (simple approach) or batch API if available. 
        // We'll just loop calls for simplicity as local JSON is fast.
        for (const id of Array.from(selectedIds)) {
            const item = items.find(i => i.id === id);
            if (item) {
                await fetch(`/api/items?id=${id}&type=${item.type}`, { method: 'DELETE' });
            }
        }

        setItems(prev => prev.filter(i => !selectedIds.has(i.id)));
        setSelectedIds(new Set());
    };

    const handleDelete = async (id: string, type: 'doc' | 'photo') => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await fetch(`/api/items?id=${id}&type=${type}`, { method: 'DELETE' });
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (e) {
            alert('Failed to delete');
        }
    };

    const startEdit = (item: Item) => {
        setEditingId(item.id);
        setEditValue(item.title);
    };

    const saveEdit = async (id: string, type: 'doc' | 'photo') => {
        try {
            const res = await fetch('/api/items', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type, title: editValue })
            });
            if (res.ok) {
                setItems(prev => prev.map(i => i.id === id ? { ...i, title: editValue } : i));
                setEditingId(null);
            }
        } catch (e) {
            alert('Failed to update');
        }
    };

    return (
        <section className={`${styles.card} glass-panel`}>
            <h2>📂 Manage Existing Content</h2>

            {selectedIds.size > 0 && (
                <div className={styles.bulkBar}>
                    <span className={styles.bulkInfo}>{selectedIds.size} Selected</span>
                    <button onClick={handleBulkDelete} className={styles.btnDeleteSelected}>Delete Selected</button>
                </div>
            )}

            <div className={styles.list}>
                {items.length === 0 && <p className={styles.subtext}>No items found.</p>}

                {items.map(item => (
                    <div key={item.id} className={styles.listItem}>
                        <div className={styles.itemInfo}>
                            <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={selectedIds.has(item.id)}
                                onChange={() => toggleSelect(item.id)}
                            />

                            <div className={styles.thumbnailWrapper}>
                                {item.type === 'photo' ? (
                                    <img src={item.url} alt="" className={styles.thumbnail} />
                                ) : (
                                    <span className={styles.docIcon}>📄</span>
                                )}
                            </div>

                            <span className={styles.typeBadge}>{item.type === 'doc' ? 'DOC' : 'IMG'}</span>
                            {editingId === item.id ? (
                                <input
                                    className={styles.editInput}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                />
                            ) : (
                                <a href={item.url} target="_blank" className={styles.itemTitle}>{item.title}</a>
                            )}
                        </div>
                        <div className={styles.actions}>
                            {editingId === item.id ? (
                                <>
                                    <button onClick={() => saveEdit(item.id, item.type)} className={styles.btnIcon}>✅</button>
                                    <button onClick={() => setEditingId(null)} className={styles.btnIcon}>❌</button>
                                </>
                            ) : (
                                <button onClick={() => startEdit(item)} className={styles.btnIcon}>✏️</button>
                            )}
                            <button onClick={() => handleDelete(item.id, item.type)} className={styles.btnIconDelete}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
