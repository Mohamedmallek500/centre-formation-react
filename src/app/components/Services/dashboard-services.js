// services/dashboard.service.js
import axios from "./axios";

const DashboardService = {

  // 🔹 GET STATS GLOBALES
  // GET /api/dashboard/stats
  getStats: () => {
    return axios.get("/dashboard/stats");
  },

  // 🔹 GET INSCRIPTIONS RÉCENTES
  // GET /api/dashboard/recent-inscriptions
  getRecentInscriptions: () => {
    return axios.get("/dashboard/recent-inscriptions");
  },

  // 🔹 GET STATS PAR SPÉCIALITÉ
  // GET /api/dashboard/specialite-stats
  getSpecialiteStats: () => {
    return axios.get("/dashboard/specialite-stats");
  },

  // 🔹 GET TOUTES LES DONNÉES DU DASHBOARD (en parallèle)
  getAllDashboardData: async () => {
    try {
      const [stats, recentInscriptions, specialiteStats] = await Promise.all([
        axios.get("/dashboard/stats"),
        axios.get("/dashboard/recent-inscriptions"),
        axios.get("/dashboard/specialite-stats")
      ]);

      return {
        stats: stats.data,
        recentInscriptions: recentInscriptions.data,
        specialiteStats: specialiteStats.data
      };
    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);
      throw error;
    }
  }
};

export default DashboardService;