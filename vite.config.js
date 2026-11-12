import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
// Ports come from plain (non-VITE_) environment variables read here in Node only; nothing is exposed to the client.
// DEV_PORT: the dev server (default 5173). API_PORT: where npm run server listens (default 5174).
// strictPort stops Vite from silently moving onto the API port when DEV_PORT is taken.
const DEV_PORT=Number(process.env.DEV_PORT)||5173,API_PORT=Number(process.env.API_PORT)||5174;
export default defineConfig({plugins:[react()],server:{host:'127.0.0.1',port:DEV_PORT,strictPort:true,proxy:{'/api':'http://127.0.0.1:'+API_PORT}},build:{chunkSizeWarningLimit:1600}});
