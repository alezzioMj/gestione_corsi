import axios from "axios";
import { API_BASE_URL } from "./config";

export const api = axios.create({
  baseURL: API_BASE_URL, 
});

export const API_ENDPOINTS = {
  sessioniFull: `/sessioni/full/`,
  docenti: `/docenti/`,
  corsi: `/corsi/`,
  programmi: `/programmi/`,
  sedi : `/sedi/`,
  materiali : `/materiali/`,
  moduli : `/moduli/`,
  aule : `/aula/`
} as const;