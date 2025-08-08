import React from "react";
import type { FlashcardItem } from "../types";
import "./FlashcardViewer.css";

interface FlashcardViewerProps {
  flashcards: FlashcardItem[];
  currentIndex: number;
  isFlipped: boolean;
  onFlip: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  flashcards,
  currentIndex,
  isFlipped,
  onFlip,
  onPrevious,
  onNext,
}) => {
  const flashcard = flashcards[currentIndex];
  if (!flashcard) return null;

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center  px-4 py-2 rounded-full shadow-sm border border-gray-200 mb-4">
            <span className="text-sm font-medium ">
              {currentIndex + 1} of {flashcards.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-[#1976D2] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div
            className="card-container cursor-pointer group"
            onClick={onFlip}
            style={{ perspective: '1000px' }}
          >
            <div className={`card-inner w-80 sm:w-96 md:w-[500px] lg:w-[600px] h-64 sm:h-72 md:h-80 lg:h-96 relative transition-transform duration-700 ${isFlipped ? 'flipped' : ''}`}>
              {/* Front Side */}
              <div className="face front absolute w-full h-full flex flex-col justify-center items-center rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 group-hover:shadow-2xl transition-shadow duration-300">
                <div className="absolute top-4 left-4 flex items-center">
                  <div className="w-3 h-3 bg-[#1976D2] rounded-full mr-2"></div>
                  <span className="text-sm font-semibold text-[#1976D2] uppercase tracking-wide">Question</span>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center w-full px-4">
                  {flashcard.image && (
                    <div className="mb-4 w-full flex justify-center">
                      <img
                        src={flashcard.image.url}
                        alt={flashcard.image.alt}
                        className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 
                   object-cover rounded-xl "
                      />
                    </div>
                  )}
                  <div className="text-center text-lg sm:text-xl md:text-2xl font-medium leading-relaxed max-w-prose break-words">
                    {flashcard.question}
                  </div>
                </div>

              </div>

              {/* Back Side */}
              <div className="text-white face back absolute w-full h-full flex flex-col justify-center items-center bg-gradient-to-br from-[#1976D2] to-[#1565C0] rounded-2xl shadow-xl border border-blue-200 p-6 sm:p-8">
                <div className="absolute top-4 left-4 flex items-center">
                  <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                  <span className="text-sm font-semibold  uppercase tracking-wide">Answer</span>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center w-full">
                  <div className="text-center  text-lg sm:text-xl md:text-2xl font-medium leading-relaxed max-w-full overflow-hidden">
                    {flashcard.answer}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center items-center gap-4 sm:gap-6">
          <button
            onClick={onPrevious}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 border-2 border-gray-200 rounded-full shadow-md hover:shadow-lg hover:border-[#1976D2] hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white transition-all duration-200 group"
            disabled={currentIndex === 0}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6  group-hover:text-[#1976D2] group-disabled:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex flex-col items-center">
            <div className=" px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-md border border-gray-200">
              <span className="text-sm sm:text-base font-semibold ">
                {currentIndex + 1} / {flashcards.length}
              </span>
            </div>
            <button
              onClick={onFlip}
              className="mt-2 px-3 py-1 text-xs sm:text-sm text-[#1976D2] hover:text-[#1565C0] font-medium transition-colors duration-200"
            >
              {isFlipped ? 'Show Question' : 'Show Answer'}
            </button>
          </div>

          <button
            onClick={onNext}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 border-2 border-gray-200 rounded-full shadow-md hover:shadow-lg hover:border-[#1976D2] hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white transition-all duration-200 group"
            disabled={currentIndex === flashcards.length - 1}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-[#1976D2] group-disabled:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default FlashcardViewer;