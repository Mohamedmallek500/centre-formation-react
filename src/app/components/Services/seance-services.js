// services/seance-services.js
import axios from "./axios";

const SeanceService = {

  // =========================
  // CREATE (ADMIN)
  // POST /api/seances
  // =========================
  create: (groupeId, coursId, heureDebut, heureFin, salle, typeSeance) => {
    return axios.post("/seances", {
      groupeId,
      coursId,
      heureDebut,
      heureFin,
      salle,
      typeSeance
    });
  },

  // =========================
  // READ ALL
  // GET /api/seances
  // =========================
  getAll: () => {
    return axios.get("/seances");
  },

  // =========================
  // READ ONE
  // GET /api/seances/{id}
  // =========================
  getById: (id) => {
    return axios.get(`/seances/${id}`);
  },

  // =========================
  // EMPLOI DU TEMPS GROUPE
  // GET /api/seances/groupe/{groupeId}
  // =========================
  getByGroupe: (groupeId) => {
    return axios.get(`/seances/groupe/${groupeId}`);
  },

  // =========================
  // EMPLOI DU TEMPS FORMATEUR
  // GET /api/seances/formateur/{formateurId}
  // =========================
  getByFormateur: (formateurId) => {
    return axios.get(`/seances/formateur/${formateurId}`);
  },

  // =========================
  // DELETE
  // DELETE /api/seances/{id}
  // =========================
  delete: (id) => {
    return axios.delete(`/seances/${id}`);
  }
};

export default SeanceService;
