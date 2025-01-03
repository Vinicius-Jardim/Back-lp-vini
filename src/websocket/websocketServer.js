import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import config from '../../config.js';
import { User } from '../models/usersModel.js';

export const setupWebSocket = (server) => {
    const wss = new WebSocketServer({ 
        server,
        path: '/ws'
    });

    const clients = new Map();

    wss.on('connection', (ws, req) => {
        console.log('Nova conexão WebSocket estabelecida');
        let userId = null;
        let isAuthenticated = false;

        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true;
        });

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message.toString());
                console.log('Mensagem recebida:', data);

                switch (data.type) {
                    case 'auth':
                        try {
                            const decoded = jwt.verify(data.token, config.secretKey);
                            userId = decoded.id;
                            isAuthenticated = true;

                            // Remover conexão existente se houver
                            const existingConnection = clients.get(userId);
                            if (existingConnection) {
                                existingConnection.close();
                            }

                            clients.set(userId, ws);
                            console.log('Usuário autenticado:', userId);

                            ws.send(JSON.stringify({
                                type: 'connection_success',
                                userId: userId,
                                timestamp: new Date().toISOString()
                            }));
                        } catch (error) {
                            console.error('Erro de autenticação:', error);
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'Falha na autenticação'
                            }));
                            ws.close();
                        }
                        break;

                    case 'message':
                        if (!isAuthenticated) {
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'Não autenticado'
                            }));
                            return;
                        }

                        try {
                            if (!data.messageId || !data.content || !data.recipientId) {
                                throw new Error('Dados da mensagem incompletos');
                            }

                            const messageData = {
                                type: 'message',
                                messageId: data.messageId,
                                senderId: userId,
                                recipientId: data.recipientId,
                                content: data.content,
                                timestamp: new Date().toISOString()
                            };

                            // Enviar para o destinatário
                            const recipientWs = clients.get(data.recipientId);
                            if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                                recipientWs.send(JSON.stringify(messageData));
                            }

                            // Confirmar envio para o remetente
                            ws.send(JSON.stringify({
                                type: 'message_sent',
                                ...messageData
                            }));
                        } catch (error) {
                            console.error('Erro ao processar mensagem:', error);
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'Erro ao processar mensagem: ' + error.message
                            }));
                        }
                        break;

                    case 'typing_status':
                        if (!isAuthenticated) {
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'Não autenticado'
                            }));
                            return;
                        }

                        console.log('Recebido status de digitação:', data);

                        const typingData = {
                            type: 'typing_status',
                            senderId: userId,
                            isTyping: data.isTyping
                        };

                        // Enviar status de digitação para o destinatário
                        const recipientWsTyping = clients.get(data.recipientId);
                        if (recipientWsTyping && recipientWsTyping.readyState === WebSocket.OPEN) {
                            console.log(`Enviando status de digitação: ${userId} está ${data.isTyping ? 'digitando' : 'parou de digitar'} para ${data.recipientId}`);
                            recipientWsTyping.send(JSON.stringify(typingData));
                        }
                        break;

                    case 'message_deleted':
                        if (!isAuthenticated) {
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'Não autenticado'
                            }));
                            return;
                        }

                        try {
                            // Buscar informações do usuário que deletou
                            const sender = await User.findById(userId);
                            
                            // Enviar notificação para o destinatário
                            const recipientWs = clients.get(data.recipientId);
                            if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                                recipientWs.send(JSON.stringify({
                                    type: 'message_deleted',
                                    messageId: data.messageId,
                                    senderId: userId,
                                    senderName: sender.name,
                                    recipientId: data.recipientId
                                }));
                            }
                        } catch (error) {
                            console.error('Erro ao processar deleção de mensagem:', error);
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'Erro ao processar deleção de mensagem'
                            }));
                        }
                        break;

                    default:
                        console.log('Tipo de mensagem não reconhecido:', data.type);
                }
            } catch (error) {
                console.error('Erro ao processar mensagem:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Erro ao processar mensagem'
                }));
            }
        });

        ws.on('close', () => {
            if (userId) {
                console.log('Usuário desconectado:', userId);
                clients.delete(userId);
            }
        });

        ws.on('error', (error) => {
            console.error('Erro na conexão WebSocket:', error);
            if (userId) {
                clients.delete(userId);
            }
        });
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) {
                console.log('Fechando conexão inativa');
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(interval);
    });

    return wss;
} 