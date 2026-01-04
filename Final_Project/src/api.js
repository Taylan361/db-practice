import axios from 'axios';

const BASE_URL = "https://db-final-kh6u.onrender.com";
const API_URL = `${BASE_URL}/api`;

export const api = axios.create({ baseURL: BASE_URL });

export const getTheses = () => api.get('/api/theses');
export const addThesis = (data) => api.post('/api/theses', data);
export const deleteThesis = (id) => api.delete(`/api/theses/${id}`);

export const searchTheses = (filters) => {
    const cleanParams = {};
    for (const key in filters) {
        if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
            cleanParams[key] = filters[key];
        }
    }
    return api.get('/api/search', { params: cleanParams });
};

export const getPeople = () => axios.get(`${API_URL}/people`);
export const addPerson = (data) => axios.post(`${API_URL}/people`, data);
export const updatePerson = (id, data) => axios.put(`${API_URL}/people/${id}`, data);
export const deletePerson = (id) => axios.delete(`${API_URL}/people/${id}`);

export const getInstitutes = () => axios.get(`${API_URL}/institutes`);
export const addInstitute = (data) => axios.post(`${API_URL}/institutes`, data);
export const updateInstitute = (id, data) => axios.put(`${API_URL}/institutes/${id}`, data);
export const deleteInstitute = (id) => axios.delete(`${API_URL}/institutes/${id}`);

export const getUniversities = () => axios.get(`${API_URL}/universities`);
export const addUniversity = (data) => axios.post(`${API_URL}/universities`, data);
export const updateUniversity = (id, data) => axios.put(`${API_URL}/universities/${id}`, data);
export const deleteUniversity = (id) => axios.delete(`${API_URL}/universities/${id}`);

export const getLanguages = () => axios.get(`${API_URL}/languages`);
export const addLanguage = (data) => axios.post(`${API_URL}/languages`, data);
export const updateLanguage = (id, data) => axios.put(`${API_URL}/languages/${id}`, data);
export const deleteLanguage = (id) => axios.delete(`${API_URL}/languages/${id}`);

export const getTypes = () => axios.get(`${API_URL}/types`);
export const addType = (data) => axios.post(`${API_URL}/types`, data);
export const updateType = (id, data) => axios.put(`${API_URL}/types/${id}`, data);
export const deleteType = (id) => axios.delete(`${API_URL}/types/${id}`);

export const getTopics = () => axios.get(`${API_URL}/topics`);
export const addTopic = (data) => axios.post(`${API_URL}/topics`, data);
export const updateTopic = (id, data) => axios.put(`${API_URL}/topics/${id}`, data);
export const deleteTopic = (id) => axios.delete(`${API_URL}/topics/${id}`);

export const getKeywords = () => axios.get(`${API_URL}/keywords`);
export const addKeyword = (data) => axios.post(`${API_URL}/keywords`, data);
export const updateKeyword = (id, data) => axios.put(`${API_URL}/keywords/${id}`, data);
export const deleteKeyword = (id) => axios.delete(`${API_URL}/keywords/${id}`);