// services/session-pedagogique-services.js
import axios from "./axios";

const SessionPedagogiqueService = {

  // =========================
  // CREATE
  // POST /api/sessions
  // =========================
  create: (annee, semestre) => {
    return axios.post("/sessions", {
      annee,
      semestre
    });
  },

  // =========================
  // READ ALL
  // GET /api/sessions
  // =========================
  getAll: () => {
    return axios.get("/sessions");
  },

  // =========================
  // READ ONE
  // GET /api/sessions/{id}
  // =========================
  getById: (id) => {
    return axios.get(`/sessions/${id}`);
  }
};

export default SessionPedagogiqueService;
