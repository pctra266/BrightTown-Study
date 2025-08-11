import { useState, useEffect } from "react";
import {getFlashcardSets } from "../services/flashcardService";
import type { FlashcardSetMeta } from "../types";

export const useFlashcardSets = () => {
const [flashcardSets, setFlashcardSets] = useState<FlashcardSetMeta[]>([]);

useEffect(() => {fetchData();}, []);
const fetchData = async () => {
  const dataFlashcard = await getFlashcardSets();
  setFlashcardSets(dataFlashcard.filter((f: FlashcardSetMeta) => f.status === true));
};

  return{flashcardSets, fetchData};
}

