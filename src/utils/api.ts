import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // URL backend Laravel
  headers: {
    'Content-Type': 'application/json',
  }
});

// Function to set the Authorization token
export const setAuthToken = (token: string) => {
  api.defaults.headers['Authorization'] = `Bearer ${token}`;
};

export default api;
