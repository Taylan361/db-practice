import axios from 'axios';

// Render'daki Backend adresin
const BASE_URL = "https://db-final-kh6u.onrender.com";

export const api = axios.create({
    baseURL: BASE_URL,
});

// GET (Tüm Tezleri Çek)
export const getTheses = () => api.get('/api/theses');

// POST (Tez Ekle)
export const addThesis = (data) => api.post('/api/theses', data);

// DELETE (Tez Sil)
export const deleteThesis = (id) => api.delete(`/api/theses/${id}`);

// --- ARAMA FONKSİYONU ---
export const searchTheses = (filters) => {
    const cleanParams = {};
    
    for (const key in filters) {
        if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
            cleanParams[key] = filters[key];
        }
    }

    console.log("Backend'e giden parametreler:", cleanParams);
    return api.get('/api/search', { params: cleanParams });
};

// Dropdown Verileri (Kişiler, Enstitüler vb.)
export const getPeople = () => api.get('/api/people');
export const getInstitutes = () => api.get('/api/institutes');
export const getLanguages = () => api.get('/api/languages');
export const getTypes = () => api.get('/api/types');

// Yeni Kişi Ekle (Frontend sadece istek atar, SQL sorgusu yazmaz)
export const addPerson = (personData) => api.post('/api/people', personData);

// --- UNIVERSITIES ---
export const addUniversity = (data) => axios.post(`${API_URL}/universities`, data);
export const updateUniversity = (id, data) => axios.put(`${API_URL}/universities/${id}`, data);
export const deleteUniversity = (id) => axios.delete(`${API_URL}/universities/${id}`);

// --- INSTITUTES ---
export const addInstitute = (data) => axios.post(`${API_URL}/institutes`, data);
export const updateInstitute = (id, data) => axios.put(`${API_URL}/institutes/${id}`, data);
export const deleteInstitute = (id) => axios.delete(`${API_URL}/institutes/${id}`);

// --- LANGUAGES ---
export const addLanguage = (data) => axios.post(`${API_URL}/languages`, data);
export const updateLanguage = (id, data) => axios.put(`${API_URL}/languages/${id}`, data);
export const deleteLanguage = (id) => axios.delete(`${API_URL}/languages/${id}`);



// --- PEOPLE (Yazarlar/Danışmanlar) ---
// getPeople ve addPerson zaten vardı, şunları ekle:
export const updatePerson = (id, data) => axios.put(`${API_URL}/people/${id}`, data);
export const deletePerson = (id) => axios.delete(`${API_URL}/people/${id}`);

// --- THESIS TYPES (Tez Türleri) ---
// getTypes zaten vardı, şunları ekle:
export const addType = (data) => axios.post(`${API_URL}/types`, data);
export const updateType = (id, data) => axios.put(`${API_URL}/types/${id}`, data);
export const deleteType = (id) => axios.delete(`${API_URL}/types/${id}`);

// --- TOPICS (Konular) ---
export const getTopics = () => axios.get(`${API_URL}/topics`);
export const addTopic = (data) => axios.post(`${API_URL}/topics`, data);
export const updateTopic = (id, data) => axios.put(`${API_URL}/topics/${id}`, data);
export const deleteTopic = (id) => axios.delete(`${API_URL}/topics/${id}`);

// --- KEYWORDS (Anahtar Kelimeler) ---
export const getKeywords = () => axios.get(`${API_URL}/keywords`);
export const addKeyword = (data) => axios.post(`${API_URL}/keywords`, data);
export const updateKeyword = (id, data) => axios.put(`${API_URL}/keywords/${id}`, data);
export const deleteKeyword = (id) => axios.delete(`${API_URL}/keywords/${id}`);