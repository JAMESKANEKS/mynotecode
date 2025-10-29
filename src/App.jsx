import { useState, useEffect } from "react";
import "./App.css";
import logo from "./assets/logo.png";

// 🔹 Firebase imports
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

function App() {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // 👈 NEW: track if editing or viewing

  // 🔹 Save new note to Firestore
  const handleSave = async () => {
    if (!title.trim()) return alert("Please enter a title!");
    if (!note.trim()) return alert("Please write a note!");

    try {
      setIsSaving(true);

      const newNote = {
        title,
        note,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "notes"), newNote);
      setSavedNotes((prev) => [{ id: docRef.id, ...newNote }, ...prev]);
      setTitle("");
      setNote("");
    } catch (error) {
      console.error("❌ Error saving note:", error);
      alert("Failed to save note: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 🔹 Fetch all notes
  const fetchNotes = async () => {
    const querySnapshot = await getDocs(collection(db, "notes"));
    const notes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSavedNotes(notes);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // 🔹 Open note modal
  const handleOpenNote = (note, edit = false) => {
    setSelectedNote(note);
    setIsEditMode(edit);
  };

  const handleCloseModal = () => {
    setSelectedNote(null);
    setIsEditMode(false);
  };

  // 🔹 Update note
  const handleUpdateNote = async () => {
    if (!selectedNote.title.trim() || !selectedNote.note.trim()) {
      return alert("Please fill in both the title and note!");
    }

    try {
      setIsUpdating(true);
      const noteRef = doc(db, "notes", selectedNote.id);
      await updateDoc(noteRef, {
        title: selectedNote.title,
        note: selectedNote.note,
      });
      alert("✅ Note updated successfully!");
      fetchNotes();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 🔹 Delete note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await deleteDoc(doc(db, "notes", noteId));
      fetchNotes();
      alert("🗑️ Note deleted successfully!");
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note.");
    }
  };

  return (
    <div className="container">
      {/* 🔹 Navbar */}
      <nav className="nav-bar">
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <div className="box">
          <h1>Welcome to My Notes App</h1>
          <p>Write, view, and edit your notes below 👇</p>
        </div>
      </nav>

      {/* 🔹 Note Input Section */}
      <div className="upload-container">
        <div className="spacer">
          <h2>Create a New Note</h2>

          <input
            type="text"
            placeholder="Enter title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          <textarea
            placeholder="Write your note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>

          <button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Note"}
          </button>

          {/* 🔹 Notes List */}
          <div className="notes-list">
            <h3>Saved Notes</h3>

            <button
              onClick={fetchNotes}
              style={{
                marginBottom: "15px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Refresh Notes
            </button>

            {savedNotes.length === 0 && <p>No notes yet.</p>}

            {savedNotes.map((n) => (
              <div key={n.id} className="note-card">
                <h4>{n.title || "Untitled"}</h4>
                <p>
                  {n.note?.length > 50
                    ? n.note.substring(0, 50) + "..."
                    : n.note}
                </p>
                <div className="card-buttons">
                  <button onClick={() => handleOpenNote(n, false)}>View</button>
                  <button onClick={() => handleOpenNote(n, true)}>Edit</button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteNote(n.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔹 Modal for view or edit */}
      {selectedNote && (
        <div className="modal">
          <div className="modal-content">
            {isEditMode ? (
              <>
                <h3>✏️ Edit Note</h3>
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) =>
                    setSelectedNote({ ...selectedNote, title: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
                <textarea
                  value={selectedNote.note}
                  onChange={(e) =>
                    setSelectedNote({ ...selectedNote, note: e.target.value })
                  }
                  style={{
                    width: "100%",
                    height: "150px",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    marginBottom: "10px",
                  }}
                ></textarea>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={handleUpdateNote} disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </button>
                  <button onClick={handleCloseModal}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h3>📘 View Note</h3>
                <h4>{selectedNote.title}</h4>
                <div
                  style={{
                    backgroundColor: "#f9f9f9",
                    padding: "10px",
                    borderRadius: "5px",
                    minHeight: "100px",
                    border: "1px solid #ddd",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedNote.note}
                </div>
                <button onClick={handleCloseModal} style={{ marginTop: "10px" }}>
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
