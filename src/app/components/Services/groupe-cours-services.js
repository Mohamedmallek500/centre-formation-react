// services/groupe-cours-services.js
import axios from "./axios";

const GroupeCoursService = {

  // 🔹 CREATE
  // POST /api/groupe-cours
  create: (groupeId, coursId, volumeHoraire, coefficient) => {
    return axios.post("/groupe-cours", {
      groupeId,
      coursId,
      volumeHoraire,
      coefficient
    });
  },

  // 🔹 READ ALL
  // GET /api/groupe-cours
  getAll: () => {
    return axios.get("/groupe-cours");
  },

  // 🔹 READ ONE
  // GET /api/groupe-cours/{id}
  getById: (id) => {
    return axios.get(`/groupe-cours/${id}`);
  },

  // 🔹 UPDATE
  // PUT /api/groupe-cours/{id}
  update: (id, volumeHoraire, coefficient) => {
    return axios.put(`/groupe-cours/${id}`, {
      volumeHoraire,
      coefficient
    });
  },

  // 🔹 DELETE
  // DELETE /api/groupe-cours/{id}
  delete: (id) => {
    return axios.delete(`/groupe-cours/${id}`);
  },

  // 🔹 LISTE DES COURS D’UN GROUPE
  // GET /api/groupe-cours/groupe/{groupeId}
  getByGroupe: (groupeId) => {
    return axios.get(`/groupe-cours/groupe/${groupeId}`);
  }
};

export default GroupeCoursService;
