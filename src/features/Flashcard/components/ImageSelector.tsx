// src/components/ImageSelector.tsx
import { useState,type ChangeEvent  } from 'react';

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
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const uploadedImage: Image = {
        id: `local-${Date.now()}`, // unique id
        url: base64,
        alt: file.name,
      };
      onSelect(uploadedImage); // trigger onSelect immediately
    };
    reader.readAsDataURL(file);
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
         {/* Custom upload button */}
  <div className="flex flex-col">
    <label
      htmlFor="file-upload"
      className="cursor-pointer bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
    >
      <svg
  xmlns="http://www.w3.org/2000/svg"
  className="h-5 w-5"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M12 19V5m0 0l-6 6m6-6l6 6"
  />
</svg>

    </label>
    <input
      id="file-upload"
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      className="hidden"
    />
  </div>
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
