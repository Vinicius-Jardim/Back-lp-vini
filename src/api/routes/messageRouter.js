import express from 'express';
import { MessageController } from '../../controllers/messageController.js';
import { verifyToken } from '../../middlewares/verifyToken.js';
import authorize from '../../middlewares/authorize.js';
import { checkUserExists } from '../../middlewares/checkUser.js';
import { roles } from '../../models/usersModel.js';

const router = express.Router();
const messageController = new MessageController();

// Rotas para mensagens (protegidas por autenticação)
router.use(verifyToken); // Verifica o token em todas as rotas
router.use(checkUserExists); // Verifica se o usuário existe

// Qualquer usuário autenticado pode enviar/receber mensagens
router.post('/send', messageController.sendMessage);
router.get('/conversations', messageController.getConversations);
router.get('/history/:recipientId', messageController.getMessageHistory);
router.post('/mark-read', messageController.markAsRead);

// Adicionar nova rota para deletar mensagens
router.delete('/delete/:messageId', messageController.deleteMessage);

export default router; 