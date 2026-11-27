// Reads Vite env variables once and fails early if one is missing
const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error("VITE_API_URL is missing. Copy .env.example to .env and set it.");
}

export const env = {
  apiUrl: apiUrl as string,
} as const;
