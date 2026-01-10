// services/formateur-services.js
import axios from "./axios";

const FormateurService = {

  // =========================
  // READ ALL
  // GET /api/formateurs
  // =========================
  getAll: () => {
    return axios.get("/formateurs");
  },

  // =========================
  // READ ONE
  // GET /api/formateurs/{id}
  // =========================
  getById: (id) => {
    return axios.get(`/formateurs/${id}`);
  },

  // =========================
  // UPDATE
  // PUT /api/formateurs/{id}
  // =========================
  update: (id, formateur) => {
    return axios.put(`/formateurs/${id}`, formateur);
  },

  // =========================
  // DELETE
  // DELETE /api/formateurs/{id}
  // =========================
  delete: (id) => {
    return axios.delete(`/formateurs/${id}`);
  },

  // =========================
  // COURS D’UN FORMATEUR
  // GET /api/formateurs/{id}/cours
  // =========================
  getCoursByFormateur: (id) => {
    return axios.get(`/formateurs/${id}/cours`);
  }
};

export default FormateurService;
