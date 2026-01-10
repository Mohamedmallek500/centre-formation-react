// services/note-services.js
import axios from "./axios";

const NoteService = {

  // 🔹 CREATE
  // POST /api/notes
  create: (noteRequest) => {
    return axios.post("/notes", noteRequest);
  },

  // 🔹 UPDATE
  // PUT /api/notes/{id}
  update: (id, valeur) => {
    return axios.put(`/notes/${id}`, {
      valeur
    });
  },

  // 🔹 NOTES D’UN ÉTUDIANT
  // GET /api/notes/etudiant/{id}
  getByEtudiant: (etudiantId) => {
    return axios.get(`/notes/etudiant/${etudiantId}`);
  },

  // 🔹 NOTES D’UN COURS
  // GET /api/notes/cours/{id}
  getByCours: (coursId) => {
    return axios.get(`/notes/cours/${coursId}`);
  },

  // 🔹 DELETE
  // DELETE /api/notes/{id}
  delete: (id) => {
    return axios.delete(`/notes/${id}`);
  }
};

export default NoteService;
