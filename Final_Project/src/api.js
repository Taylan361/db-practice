import axios from 'axios';

// DİKKAT: Adres tırnak işaretleri içinde olmalı.
// Render'dan aldığın backend linki:
const BASE_URL = "https://db-final-kh6u.onrender.com";

export const api = axios.create({
    // Buraya dikkat: değişkenin adı BASE_URL olmalı.
    // Eğer buraya yanlışlıkla 'base' yazdıysan veya tırnak hatası yaptıysan o hatayı alırsın.
    baseURL: BASE_URL, 
});

export const getTheses = () => api.get('/api/theses');
export const addThesis = (thesisData) => api.post('/api/theses', thesisData);
export const deleteThesis = (id) => api.delete(`/api/theses/${id}`);
// ... önceki kodlar aynı kalsın ...

export const getPeople = () => api.get('/api/people');
export const getInstitutes = () => api.get('/api/institutes');
export const getLanguages = () => api.get('/api/languages');
export const getTypes = () => api.get('/api/types');

export const searchTheses = (params) => api.get('/api/search', { params });