import { useState, useEffect } from "react";
import "./App.css";
import logo from "./assets/logo.png";

// 🔹 Firebase imports
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

function App() {
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 🔹 Save text note to Firestore
  const handleSave = async () => {
    if (!note.trim()) return alert("Please write a note!");

    try {
      setIsSaving(true);

      const newNote = {
        fileName: "Text only",
        fileURL: "",
        storagePath: "",
        note,
        createdAt: serverTimestamp(),
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, "notes"), newNote);

      // ✅ Optimistically add note to state so UI updates immediately
      setSavedNotes((prev) => [{ id: docRef.id, ...newNote }, ...prev]);

      setNote("");       // clear input
      setIsSaving(false); // stop loading
    } catch (error) {
      console.error("❌ Error saving note:", error);
      alert("Failed to save note: " + error.message);
      setIsSaving(false);
    }
  };

  // 🔹 Get all notes from Firestore
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
  const handleOpenNote = (note) => setSelectedNote(note);
  const handleCloseModal = () => setSelectedNote(null);

  // 🔹 Delete note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await deleteDoc(doc(db, "notes", noteId));
      fetchNotes();
      alert("Note deleted successfully!");
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
          <p>Write and save personal notes below 👇</p>
        </div>
      </nav>

      {/* 🔹 Note Input Section */}
      <div className="upload-container">
        <div className="spacer">
          <h2>Write Your Note</h2>

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

            {/* 🔹 Refresh Notes Button */}
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
                <p>
                  <strong>Note:</strong>{" "}
                  {n.note?.length > 50 ? n.note.substring(0, 50) + "..." : n.note}
                </p>
                <div className="card-buttons">
                  <button onClick={() => handleOpenNote(n)}>Open Note</button>
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

      {/* 🔹 Modal for note details */}
      {selectedNote && (
        <div className="modal">
          <div className="modal-content">
            <h3>📘 Note Details</h3>
            <p>
              <strong>Note:</strong>
            </p>
            <div className="note-code">{selectedNote.note}</div>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
