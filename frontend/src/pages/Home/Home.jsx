import NoteCard from "../../components/Cards/NoteCard";
import axiosInstance from "../../utils/axiosInstance";
import Navbar from "../../components/Navbar/Navbar";
import nodata from "../../../public/no-data.jpg";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import image from "../../../public/add.jpg";
import AddEditNotes from "./AddEditNotes";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";

import EmptyNote from "../../components/EmptyNote/EmptyNote";

function Home() {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const navigate = useNavigate();

  const handleEdit = noteDetails => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  //Get user info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.post("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status == 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  //Get all notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");

      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again later.");
    }
  };

  //Delete note
  const deleteNote = async data => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);
      if (response.data && !response.data.error) {
        alert("Note deleted successfully");
        getAllNotes();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("An unexpected error occurred. Please try again !");
      }
    }
  };

  //Search for note
  const onSearchNote = async query => {
    try {
      const response = await axiosInstance.get("/search-notes/", {
        params: { query },
      });

      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Clear Search
  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
    return () => {};
  }, []);
  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
      />
      <div className="container mx-auto">
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allNotes?.map((item, index) => {
              return (
                <NoteCard
                  key={item._id}
                  title={item.title}
                  date={item.createdOn}
                  content={item.content}
                  tags={item.tags}
                  isPinned={item.isPinned}
                  onEdit={() => {
                    handleEdit(item);
                  }}
                  onDelete={() => {
                    deleteNote(item);
                  }}
                  onPinNote={() => {}}
                />
              );
            })}
          </div>
        ) : (
          <EmptyNote
            imgSrc={isSearch ? nodata : image}
            message={
              isSearch
                ? `Oops! No notes found matching your search`
                : `Start Creating your first note...! Click the 'Add'  button to write down your thoughts, ideas, and reminders. Let's get started!`
            }
          />
        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-700 hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        ariaHideApp={false}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-x-hidden overflow-y-auto"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          getAllNotes={getAllNotes}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: {} });
          }}
        />
      </Modal>
    </>
  );
}
export default Home;
