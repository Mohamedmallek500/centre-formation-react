// services/authservices.js
import axios from "./axios";

const AuthService = {
  // ---------- LOGIN ----------
  signin: (data) => {
    return axios.post("/auth/signin", data);
  },

  // ---------- SIGNUP ----------
  signup: (data) => {
    return axios.post("/auth/signup", data);
  },

  // ---------- LOGOUT ----------
  signout: () => {
    return axios.post("/auth/signout");
  },

  // ---------- REFRESH TOKEN ----------
  refreshToken: () => {
    return axios.post("/auth/refreshtoken");
  }
};

export default AuthService;
