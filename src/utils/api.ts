import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // URL backend Laravel
  headers: {
    'Content-Type': 'application/json',
  }
});

// Function to set the Authorization token
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
