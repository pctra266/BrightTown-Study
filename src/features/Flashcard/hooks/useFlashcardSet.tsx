import { useEffect, useState } from "react";
import type { FlashcardSet } from "../types";
import { getFlashcardSetPublicById } from "../services/flashcardService";

export const useFlashcardSet = (id: string, userId: string, userRole: string) => {
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet>({} as FlashcardSet);
  const [loading, setLoading] = useState(true); // 🔹 Track loading
  const [error, setError] = useState<string | null>(null); // optional

  useEffect(() => {
    fetchFlashcardSet(id);
  }, [id]); // include `id` if it can change

  const fetchFlashcardSet = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const flashcardSetData = await getFlashcardSetPublicById(id);

      if (flashcardSetData.status) {
        setFlashcardSet(flashcardSetData);
      } else {
        setFlashcardSet({} as FlashcardSet);
      }
    } catch (err) {
      setError("Failed to load flashcard set.");
      setFlashcardSet({} as FlashcardSet);
    } finally {
      setLoading(false);
    }
  };

  return { flashcardSet, loading, error };
};
