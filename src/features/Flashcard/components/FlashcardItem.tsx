import React, { useEffect, useState } from 'react';
import type { FlashcardItem } from '../types';
import ImageSelector from './ImageSelector';
import type { Image } from '../types';

interface FlashcardItemProps {
  flashcard: FlashcardItem;
  onDelete: () => void;
  onChange: (field: 'question' | 'answer' | 'image', value: string | Image | null) => void;
  index?: number;
}

const Flashcard: React.FC<FlashcardItemProps> = ({
  flashcard,
  onDelete,
  onChange,
  index
}) => {
  const [selectedImage, setSelectedImage] = useState<Image | null>(flashcard.image ?? null);
  const [showFindImage, setShowFindImage] = useState(false);
  const handleSelectImage = (img: Image) => {
    setSelectedImage(img);
    onChange('image', img);
    setShowFindImage(false);
  }
  function togglefindImage() {
    setShowFindImage(prev => !prev);
  }
  const handleClearImage = () => {
    setSelectedImage(null);
    onChange('image', null);
  };
  useEffect(() => {
    setSelectedImage(flashcard.image ?? null);
  }, [flashcard.image]);

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-700">{index}</span>
        <button
          type="button"
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <textarea
            value={flashcard.question}
            onChange={(e) => onChange('question', e.target.value)}
            placeholder="Enter term"
            className="w-full px-4 py-3 border-b-2 border-gray-300 focus:outline-none focus:border-[#1976D2] resize-none transition-colors"
            rows={2}
          />
          <p className="text-xs text-gray-500 mt-1">TERM</p>
        </div>

        <div className="flex gap-4">
          {/* Definition area */}
          <div className="flex-[4]">
            <textarea
              value={flashcard.answer}
              onChange={(e) => onChange("answer", e.target.value)}
              placeholder="Enter definition"
              className="w-full px-4 py-3 border-b-2 border-gray-300 focus:outline-none focus:border-[#1976D2] resize-none transition-colors"
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">DEFINITION</p>
          </div>

          <div className="flex-[1] relative flex items-center justify-center">
            {selectedImage ? (
              <>
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  className="w-full h-20 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-1 right-1 text-gray-400 hover:text-red-500 transition-colors bg-white/70 rounded-full p-1"
                  title="Remove selected image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </>
            ) : (
              <div onClick={togglefindImage} className="w-full h-20 border-2 border-dashed border-gray-400 flex flex-col items-center justify-center rounded-md text-gray-500 hover:text-blue-600 cursor-pointer">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="14"
                    rx="2"
                    ry="2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 15l4-4 3 3 4-5 3 4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xs">Image</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {showFindImage && (
        <div id={`findImagefor${flashcard.id}`} className="mt-4 p-4 rounded-lg">
          <ImageSelector onSelect={handleSelectImage} />
        </div>
      )}
    </div>
  );
};

export default Flashcard;