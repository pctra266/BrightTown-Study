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

  const {flashcardSets, fetchData:fetchFlashcardSetData} = useFlashcardSets();

  const handleCreate = () => {console.log("go to create Page")};
  const handleDelete = async (id: string) => {console.log("delete",id)};
  const handleEdit = (id: string) => {console.log("edit",id)};
  const handlePlay = (id: string) =>{ console.log("play",id)};
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


