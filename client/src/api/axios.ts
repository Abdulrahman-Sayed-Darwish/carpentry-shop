import axios from "axios";
import { env } from "@/config/env";

// Interceptors (auth token + silent refresh) are added in the Auth step
export const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true, // needed so the refresh cookie is sent
});
