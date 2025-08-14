const API_URL = "https://group-03-learning-social-media-json.vercel.app";

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

export const updateFlashcardSetStatus = async (id: string, status: boolean) => {
    try {
        const res = await fetch(`${API_URL}/flashcardSets/${id}`, {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        return res.ok;
    } catch (err) {
        console.error("Failed to update status:", err);
        return false;
    }
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