import axios from 'axios';
const api = axios.create({ baseURL: process.env.ADMIN_API_URL || 'http://localhost:4000/api' });
export default {
  getUsers: () => api.get('/users').then(r => r.data),
};
