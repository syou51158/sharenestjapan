import { useState } from 'react';
import { getSupabase } from '../../lib/supabase';

type PhotoUploadProps = {
  bookingId: string;
  type: 'checkin' | 'checkout';
  onUpload?: (url: string) => void;
};

export function PhotoUpload({ bookingId, type, onUpload }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('画像を選択してください');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${bookingId}/${type}-${Date.now()}.${fileExt}`;

      const { data, error } = await getSupabase().storage
        .from('vehicle-photos')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = getSupabase().storage
        .from('vehicle-photos')
        .getPublicUrl(data.path);

      setImageUrl(publicUrl);
      onUpload?.(publicUrl);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {type === 'checkin' ? 'チェックイン' : 'チェックアウト'}写真
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={uploadPhoto}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {uploading && <p className="text-sm text-gray-500">アップロード中...</p>}
      {imageUrl && (
        <div className="mt-2">
          <img 
            src={imageUrl} 
            alt={`${type} photo`}
            className="h-32 w-32 object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
}
