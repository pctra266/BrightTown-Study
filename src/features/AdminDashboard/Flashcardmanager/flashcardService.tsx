const API_URL = "http://localhost:9000";

export type Flashcard = {
    id: string;
    question: string;
    answer: string;
    image?: {
        id: string;
        url: string;
        alt: string;
    } | null;
};

export type FlashcardSet = {
    id: string;
    userId: string;
    name: string;
    description: string;
    flashcards: Flashcard[];
    status: boolean;
};
export const getAllFlashcardSets = async (): Promise<FlashcardSet[]> => {
    const response = await fetch(`${API_URL}/flashcardSets`);
    const data = await response.json();
    return data.map((set: any) => ({
        ...set,
        status: set.status !== undefined ? set.status : true, 
    }));
};

export const deleteFlashcardSet = async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/flashcardSets/${id}`, { method: "DELETE" });
    return response.ok;
};

