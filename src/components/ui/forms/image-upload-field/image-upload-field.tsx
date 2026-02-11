import { useState, useEffect } from "react";
import styles from "./image-upload-field.module.css";

interface ImageUploadFieldProps {
  label: string;
  name: string;
  value?: string | null; // URL of current image
  onChange: (fileId: string | null) => void;
  onUpload: (file: File) => Promise<string>; // Returns fileId
  disabled?: boolean;
  loading?: boolean;
  maxSizeMB?: number;
  accept?: string;
}

export default function ImageUploadField({
  label,
  name,
  value,
  onChange,
  onUpload,
  disabled = false,
  loading = false,
  maxSizeMB = 5,
  accept = "image/jpeg,image/jpg,image/png,image/gif,image/webp",
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Sync preview with value prop
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const validateFile = (file: File): string | null => {
    // Check file type
    const acceptedTypes = accept.split(",").map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      return "Please upload a valid image file (JPEG, PNG, GIF, or WebP)";
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setPreview(null);
      setError("");
      onChange(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      // Create preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const fileId = await onUpload(file);
      onChange(fileId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      setPreview(null);
      onChange(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    void handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0] || null;
    void handleFileChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError("");
    onChange(null);
  };

  const isDisabled = disabled || loading || isUploading;

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        {label}
        {isUploading && <span className={styles.uploadingText}> (Uploading...)</span>}
      </label>

      {preview ? (
        <div className={styles.previewContainer}>
          <img src={preview} alt="Preview" className={styles.preview} />
          <button
            type="button"
            onClick={handleRemove}
            disabled={isDisabled}
            className={styles.removeButton}
          >
            Remove Image
          </button>
        </div>
      ) : (
        <div
          className={`${styles.uploadArea} ${isDragging ? styles.dragging : ""} ${isDisabled ? styles.disabled : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id={name}
            name={name}
            accept={accept}
            onChange={handleInputChange}
            disabled={isDisabled}
            className={styles.fileInput}
          />
          <label htmlFor={name} className={styles.uploadLabel}>
            <div className={styles.uploadIcon}>📷</div>
            <div className={styles.uploadText}>
              <span className={styles.uploadTextPrimary}>
                {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
              </span>
              <span className={styles.uploadTextSecondary}>
                PNG, JPG, GIF or WebP (max {maxSizeMB}MB)
              </span>
            </div>
          </label>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}

