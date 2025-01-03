import express from "express";
import cors from "cors";
import { createServer } from "http";
import config from "./config.js";
import { db } from "./src/utils/dbConnection.js";
import { routes } from "./src/api/router.js";
import { setupWebSocket } from "./src/websocket/websocketServer.js";

const port = process.env.PORT || config.port;
const app = express();
const server = createServer(app);

// Configure CORS
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'https://lemon-plant-0a81c1203.4.azurestaticapps.net'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Inicializar WebSocket Server
const wss = setupWebSocket(server);

// Log para debug do WebSocket
wss.on('connection', (ws, req) => {
    console.log('Nova conexão WebSocket estabelecida');
    
    ws.on('close', () => {
        console.log('Conexão WebSocket fechada');
    });
});

db();
app.use("/uploads", express.static("uploads"));
app.use(express.json());

for (const route of routes) {
    app.use(route.path, route.router);
}

server.listen(port, () => {
    console.log(`Server HTTP rodando em http://localhost:${port}`);
    console.log(`Server WebSocket rodando em ws://localhost:${port}/ws`);
});
