// services/groupe-services.js
import axios from "./axios";

const GroupeService = {

  // 🔹 CREATE
  // POST /api/groupes
  creer: (nom, sessionId) => {
    return axios.post("/groupes", {
      nom,
      sessionId
    });
  },

  // 🔹 READ ALL
  // GET /api/groupes
  getAll: () => {
    return axios.get("/groupes");
  },

  // 🔹 READ ONE
  // GET /api/groupes/{id}
  getById: (id) => {
    return axios.get(`/groupes/${id}`);
  }
};

export default GroupeService;
