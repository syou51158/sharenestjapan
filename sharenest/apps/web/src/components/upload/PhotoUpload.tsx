import { useState } from 'react';
import { getSupabase } from '../../lib/supabase';

// Two modes of usage:
// 1) Booking mode (existing): upload a single photo for checkin/checkout linked to a bookingId
// 2) Gallery mode (new): manage multiple vehicle photos with photos state controlled by parent

type BookingPhotoUploadProps = {
  bookingId: string;
  type: 'checkin' | 'checkout';
  onUpload?: (url: string) => void;
};

type GalleryPhotoUploadProps = {
  photos: string[];
  onChange: (urls: string[]) => void;
  maxPhotos?: number;
};

type PhotoUploadProps = BookingPhotoUploadProps | GalleryPhotoUploadProps;

export function PhotoUpload(props: PhotoUploadProps) {
  const isGallery = 'photos' in props && 'onChange' in props;

  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // used only in booking mode

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      const files = event.target.files;
      if (!files || files.length === 0) {
        throw new Error('画像を選択してください');
      }

      // Helper to upload a single file and return its public URL
      const uploadSingle = async (file: File, pathPrefix: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${pathPrefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { data, error } = await getSupabase().storage
          .from('vehicle-photos')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = getSupabase().storage
          .from('vehicle-photos')
          .getPublicUrl(data.path);

        return publicUrl as string;
      };

      if (isGallery) {
        // Gallery mode: allow multiple uploads and append to photos
        const current = props.photos ?? [];
        const max = props.maxPhotos ?? 10;
        const remaining = Math.max(0, max - current.length);
        const filesToUpload = Array.from(files).slice(0, remaining);

        const uploadedUrls: string[] = [];
        for (const file of filesToUpload) {
          const url = await uploadSingle(file, 'gallery');
          uploadedUrls.push(url);
        }
        props.onChange([...current, ...uploadedUrls]);
      } else {
        // Booking mode: single file upload
        const file = files[0];
        const pathPrefix = `${props.bookingId}/${props.type}`;
        const url = await uploadSingle(file, pathPrefix);
        setImageUrl(url);
        props.onUpload?.(url);
      }
    } catch (error: any) {
      alert(error.message ?? '画像アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    if (!isGallery) return;
    const next = props.photos.filter((_, i) => i !== index);
    props.onChange(next);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {isGallery ? '車両写真' : props.type === 'checkin' ? 'チェックイン写真' : 'チェックアウト写真'}
      </label>

      <input
        type="file"
        accept="image/*"
        multiple={isGallery}
        onChange={uploadPhoto}
        disabled={uploading || (isGallery && (props.photos?.length ?? 0) >= (props.maxPhotos ?? 10))}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
      />

      {uploading && <p className="text-sm text-gray-500">アップロード中...</p>}

      {/* Booking mode: show last uploaded image */}
      {!isGallery && imageUrl && (
        <div className="mt-2">
          <img
            src={imageUrl}
            alt={`${'type' in props ? props.type : 'photo'} photo`}
            className="h-32 w-32 object-cover rounded-md"
          />
        </div>
      )}

      {/* Gallery mode: thumbnails grid */}
      {isGallery && props.photos.length > 0 && (
        <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {props.photos.map((url, idx) => (
            <div key={idx} className="relative group">
              <img src={url} alt={`photo-${idx}`} className="h-24 w-24 object-cover rounded-md" />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition"
                aria-label="写真を削除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {isGallery && (
        <p className="text-xs text-gray-500">
          {`${props.photos.length}/${props.maxPhotos ?? 10} 枚`}
        </p>
      )}
    </div>
  );
}
