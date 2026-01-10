// services/cours-services.js
import axios from "./axios";

const CoursService = {

  // 🔹 CREATE
  // POST /api/cours
  creer: (data) => {
    return axios.post("/cours", data);
  },

  // 🔹 READ ALL
  // GET /api/cours
  getAll: () => {
    return axios.get("/cours");
  },

  // 🔹 READ ONE
  // GET /api/cours/{id}
  getById: (id) => {
    return axios.get(`/cours/${id}`);
  },

  // 🔹 UPDATE
  // PUT /api/cours/{id}
  update: (id, data) => {
    return axios.put(`/cours/${id}`, data);
  },

  // 🔹 DELETE
  // DELETE /api/cours/{id}
  delete: (id) => {
    return axios.delete(`/cours/${id}`);
  }
};

export default CoursService;
