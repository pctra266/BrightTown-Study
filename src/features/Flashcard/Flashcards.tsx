import FlashcardSets from "./components/FlashcardSets";

import { deleteFlashcardSet } from "./services/flashcardService";

import { useNavigate } from "react-router-dom";
import { useFlashcardSets } from "./hooks/useFlashcardSets";
import { useAuth } from "../../contexts/AuthContext";

const Flashcards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || "";
  const userRoleId = user?.role || "";

  const { flashcardSets, fetchData: fetchFlashcardSetData } = useFlashcardSets();

  const handleCreate = () => { navigate(`/library/flashcard/new`); };
  const handleDelete = async (id: string) => { await deleteFlashcardSet(id, userId, userRoleId); fetchFlashcardSetData(); };
  const handleEdit = (id: string) => { navigate(`/library/flashcard/edit/${id}`); };
  const handlePlay = async (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    const key = `studied_${userId}_${id}_${today}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "true");
      try {
        const res = await fetch("http://localhost:9000/siteStats");
        const stats = await res.json();
        const todayStat = stats.find((s: any) => s.date === today);

        if (todayStat) {
          await fetch(`http://localhost:9000/siteStats/${todayStat.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              flashcardsStudied: todayStat.flashcardsStudied + 1
            })
          });
        } else {
          await fetch("http://localhost:9000/siteStats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: today,
              visits: 0,
              flashcardsStudied: 1
            })
          });
        }
      } catch (err) {
        console.error("Lỗi cập nhật flashcardsStudied:", err);
      }
    }
    navigate(`/library/flashcard/${id}/play`);
  };
  return (
    <FlashcardSets
      flashcardSets={flashcardSets}
      onCreate={handleCreate}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onPlay={handlePlay}
    />
  );
};

export default Flashcards;


