// src/components/ImageSelector.tsx
import { useState } from 'react';

type Image = {
  id: string;
  url: string;
  alt: string;
};

interface Props {
  onSelect: (image: Image) => void;
}

export default function ImageSelector({ onSelect }: Props) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("")

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchTerm}&client_id=FFYq0bk2LYCdkEfNY3vH3BWF81Bxg3iG9z_Z8384KPc`
      );
      const data = await res.json();
      const formatted = data.results.map((img: any) => ({
        id: img.id,
        url: img.urls.small,
        alt: img.alt_description || 'image',
      }));
      setImages(formatted);
    } catch (err) {
      console.error("Image fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter search term for images..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
        />
        <button
          onClick={fetchImages}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 transition"
        >
          {loading ? 'Loading...' : `Find images`}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="w-full h-[120px] overflow-hidden rounded cursor-pointer"
            onClick={() => onSelect(img)}
          >
            <img
              src={img.url}
              alt={img.alt}
              className="w-full h-full object-cover hover:opacity-80 transition"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
