'use client';

import { useState, useRef } from 'react';
import styles from './Manage.module.css';

export default function AdminClient() {
    const [docUrl, setDocUrl] = useState('');
    const [docTitle, setDocTitle] = useState('');
    const [dragging, setDragging] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Doc Handlers ---
    const handleDocSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!docUrl) return;

        try {
            setUploadStatus('Adding document...');
            const res = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: docUrl, title: docTitle || 'Untitled Doc' }),
            });

            const data = await res.json();
            if (res.ok) {
                setUploadStatus(`Success: Added "${data.item.title}"`);
                setDocUrl('');
                setDocTitle('');
            } else {
                setUploadStatus(`Error: ${data.error}`);
            }
        } catch (err) {
            setUploadStatus('Failed to connect to server');
        }
    };

    // --- Photo Handlers ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            uploadFiles(files);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadFiles(Array.from(e.target.files));
        }
    };

    const uploadFiles = async (files: File[]) => {
        let successCount = 0;
        let errors: string[] = [];
        setUploadStatus(`Uploading ${files.length} photos...`);

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                errors.push(`${file.name}: Not an image (${file.type})`);
                continue;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    successCount++;
                } else {
                    const data = await res.json();
                    errors.push(`${file.name}: ${data.error || 'Server Error'}`);
                }
            } catch (err) {
                errors.push(`${file.name}: Network Error`);
            }
        }

        if (errors.length > 0) {
            setUploadStatus(`Uploaded ${successCount}/${files.length}. Errors: ${errors.join(', ')}`);
        } else {
            setUploadStatus(`Finished: Uploaded ${successCount} photos.`);
        }
    };

    return (
        <div className={styles.adminGrid}>
            {/* Doc Section */}
            <section className={`${styles.card} glass-panel`}>
                <h2>📄 Add Google Doc</h2>
                <form onSubmit={handleDocSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Document Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Project Specs"
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Share Link</label>
                        <input
                            type="url"
                            placeholder="https://docs.google.com/..."
                            value={docUrl}
                            onChange={(e) => setDocUrl(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary">Add Document</button>
                </form>
            </section>

            {/* Photo Section */}
            <section className={`${styles.card} glass-panel`}>
                <h2>📸 Upload Photos</h2>
                <div
                    className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                    <p className={styles.dropText}>
                        {dragging ? 'Drop files here!' : 'Drag & Drop photos here'}
                    </p>
                    <span className={styles.subtext}>or click to select files (Supports Multi-upload)</span>
                </div>
            </section>

            {uploadStatus && (
                <div className={`${styles.status} glass-panel animate-fade-in`}>
                    {uploadStatus}
                </div>
            )}
        </div>
    );
}
