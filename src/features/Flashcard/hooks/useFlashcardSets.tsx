import { useState, useEffect } from "react";
import { getFlashcardSets } from "../services/flashcardService";
import type { FlashcardSetMeta } from "../types";

export const useFlashcardSets = () => {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSetMeta[]>([]);
  const [loading, setLoading] = useState(true); // 🔹 Track loading
  const [error, setError] = useState<string | null>(null); // 🔹 Track error

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const dataFlashcard = await getFlashcardSets();
      setFlashcardSets(
        dataFlashcard.filter((f: FlashcardSetMeta) => f.status === true)
      );
    } catch (err) {
      setError("Failed to load flashcard sets.");
      setFlashcardSets([]);
    } finally {
      setLoading(false);
    }
  };

  return { flashcardSets, loading, error, fetchData };
};
