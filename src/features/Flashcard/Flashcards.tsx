import FlashcardSets from "./components/FlashcardSets";
import { useFlashcardSets } from "./hooks/useFlashcardSets";

const Flashcards = () => {

  const {flashcardSets} = useFlashcardSets();

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


