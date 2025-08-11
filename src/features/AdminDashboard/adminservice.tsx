
import axios from "axios";

const API_URL = "http://localhost:9000";

export const getFlashcardSets = () => axios.get(`${API_URL}/flashcardSets`);
export const getAccounts = () => axios.get(`${API_URL}/account`);
export const getBooks = () => axios.get(`${API_URL}/books`);
export const getDiscussions = () => axios.get(`${API_URL}/discussions`);
export const getSiteStats = () => axios.get(`${API_URL}/siteStats`);