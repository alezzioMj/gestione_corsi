import axios from "axios";
import { API_BASE_URL } from "./config";

export const api = axios.create({
  baseURL: API_BASE_URL, 
});

export const API_ENDPOINTS = {
  sessioniFull: `${API_BASE_URL}/sessioni/full/`,
  docenti: `${API_BASE_URL}/docenti/`,
  corsi: `${API_BASE_URL}/corsi/`,
  programmi: `${API_BASE_URL}/programmi/`,
  sedi : `${API_BASE_URL}/sedi/`,
  materiali : `${API_BASE_URL}/materiali/`,
  moduli : `${API_BASE_URL}/moduli/`,
  aule : `${API_BASE_URL}/aula/`
} as const;