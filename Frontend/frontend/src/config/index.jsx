const {default:axios} = require("axios");

export const BASE_URL = "https://pro-connect-bnug.onrender.com";
export const clientServer = axios.create({
    baseURL: BASE_URL
})
