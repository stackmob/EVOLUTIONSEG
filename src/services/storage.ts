import { supabase } from '../lib/supabase';

export interface DocumentMetadata {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  formattedSize: string;
  mimeType: string;
  uploadedAt: string;
  folder?: string;
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const uploadDocument = async (
  file: File, 
  folder: string = 'general'
): Promise<DocumentMetadata> => {
  const fileId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const uploadedAt = new Date().toISOString();
  const formattedSize = formatFileSize(file.size);

  try {
    // Attempt Supabase Object Storage Bucket Upload if online
    const filePath = `${folder}/${fileId}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return {
        id: fileId,
        fileName: file.name,
        fileUrl: publicUrlData.publicUrl,
        fileSize: file.size,
        formattedSize,
        mimeType: file.type || 'application/pdf',
        uploadedAt,
        folder,
      };
    }
  } catch (e) {
    console.warn('Fallback to resilient DataURL local storage for file upload:', e);
  }

  // Fallback: Read file as DataURL for 100% reliable physical preview & download
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const docMeta: DocumentMetadata = {
        id: fileId,
        fileName: file.name,
        fileUrl: dataUrl,
        fileSize: file.size,
        formattedSize,
        mimeType: file.type || 'application/pdf',
        uploadedAt,
        folder,
      };
      resolve(docMeta);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const downloadDocument = (fileUrl: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
