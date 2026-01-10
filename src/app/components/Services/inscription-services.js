import axios from "./axios";

const InscriptionService = {

  // 🔹 Inscrire un étudiant à un groupe
  inscrire: (etudiantId, groupeId) => {
    return axios.post("/inscriptions", {
      etudiantId,
      groupeId
    });
  },

  // 🔹 ADMIN : changer le statut (VALIDEE / REFUSEE / EN_ATTENTE)
  changerStatut: (inscriptionId, statut) => {
    return axios.put(`/inscriptions/${inscriptionId}/statut`, null, {
      params: { statut }
    });
  },

  // 🔹 Lister les inscriptions d’un groupe
  getByGroupe: (groupeId) => {
    return axios.get(`/inscriptions/groupe/${groupeId}`);
  },

  // 🔹 Lister les inscriptions d’un étudiant
  getByEtudiant: (etudiantId) => {
    return axios.get(`/inscriptions/etudiant/${etudiantId}`);
  },

  // 🔹 ADMIN : Lister toutes les inscriptions avec pagination + filtres
  getAllPaginated: (page = 0, size = 12, filters = {}) => {
    return axios.get("/inscriptions", {
      params: {
        page,
        size,
        ...filters
      }
    });
  }
};

export default InscriptionService;
