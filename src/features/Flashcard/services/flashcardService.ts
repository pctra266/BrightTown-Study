import api from "../../../api/api";
import type { FlashcardSet, FlashcardSetMeta } from "../types";

export const getFlashcardSets = async () => {
  const response = await api.get<FlashcardSetMeta[]>('/flashcardSets');
  return response.data;
};

export const getFlashcardSetPublicById = async (flashcardSetId: string) => {
  const response = await api.get<FlashcardSet>(`/flashcardSets/${flashcardSetId}`);
  return response.data;
}

export const getFlashcardSetById = async (flashcardSetId: string, userId: string, role: string): Promise<FlashcardSet> => {
  const response = await api.get<FlashcardSet>(`/flashcardSets/${flashcardSetId}`);
  if (role !== '1' && response.data.userId !== userId) {
    throw new Error('Unauthorized access');
  }
  return response.data;
};

