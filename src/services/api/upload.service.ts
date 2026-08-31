import api, { multipartConfig, unwrap } from './client';

export interface UploadResult {
  url: string;
  path?: string;
}

export class UploadService {
  static async uploadFile(file: File, folder = 'uploads'): Promise<UploadResult> {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder);
    const { data } = await api.post<{ data: UploadResult } | UploadResult>('/uploads', form, multipartConfig());
    return unwrap<UploadResult>({ data });
  }

  static async uploadFiles(files: File[], folder = 'uploads'): Promise<UploadResult[]> {
    const form = new FormData();
    files.forEach((f) => form.append('files[]', f));
    form.append('folder', folder);
    const { data } = await api.post<{ data: UploadResult[] } | UploadResult[]>('/uploads/batch', form, multipartConfig());
    return unwrap<UploadResult[]>({ data });
  }

  static resolveUrl(path: string): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const base = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage/';
    return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }
}

export default UploadService;
