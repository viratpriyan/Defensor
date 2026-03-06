import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Replace with your computer's local IP address when testing on a real device
// e.g., 'http://192.168.1.5:5000' — find your IP with `ipconfig` on Windows
// For Android emulator use: 'http://10.0.2.2:5000'
export const BASE_URL = 'http://192.168.223.129:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Auth APIs ───────────────────────────────────────────────
export const registerUser = async (name, email, phone, password) => {
    const response = await api.post('/auth/register', { name, email, phone, password });
    return response.data;
};

export const loginUser = async (phone, password) => {
    const response = await api.post('/auth/login', { phone, password });
    return response.data;
};

// ─── Emergency Contact APIs ──────────────────────────────────
export const addContact = async (name, phone, relationship) => {
    const response = await api.post('/emergency/add-contact', { name, phone, relationship });
    return response.data;
};

export const getContacts = async () => {
    const response = await api.get('/emergency/contacts');
    return response.data;
};

export const deleteContact = async (id) => {
    const response = await api.delete(`/emergency/contact/${id}`);
    return response.data;
};

export const updateContact = async (id, name, phone, relationship) => {
    const response = await api.patch(`/emergency/contact/${id}`, { name, phone, relationship });
    return response.data;
};

// ─── Location APIs ───────────────────────────────────────────
export const updateLocation = async (latitude, longitude) => {
    const response = await api.post('/location/update', { latitude, longitude });
    return response.data;
};

// ─── SOS APIs ────────────────────────────────────────────────
export const triggerSOS = async (latitude, longitude) => {
    const response = await api.post('/emergency/sos', { latitude, longitude });
    return response.data;
};

export const shareLocation = async (latitude, longitude) => {
    const response = await api.post('/emergency/share-location', { latitude, longitude });
    return response.data;
};

export const getSafeZones = async (latitude, longitude) => {
    const response = await api.post('/emergency/safe-zones', { latitude, longitude });
    return response.data;
};

export const triggerDetection = async (latitude, longitude, triggerType) => {
    const response = await api.post('/emergency/trigger', { latitude, longitude, triggerType });
    return response.data;
};

export const getEmergencyHistory = async () => {
    const response = await api.get('/emergency/history');
    return response.data;
};

// ─── Route APIs ──────────────────────────────────────────────
export const analyzeRoute = async (source, destination) => {
    const response = await api.post('/route/analyze', { source, destination });
    return response.data;
};

export default api;
