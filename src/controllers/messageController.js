import { MessageService } from '../services/messageService.js';

export class MessageController {
    constructor() {
        this.messageService = new MessageService();
    }

    sendMessage = async (req, res) => {
        try {
            const message = await this.messageService.sendMessage({
                senderId: req.user,
                recipientId: req.body.recipientId,
                content: req.body.content
            });
            res.status(201).json(message);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    getConversations = async (req, res) => {
        try {
            const conversations = await this.messageService.getConversations(req.user);
            res.status(200).json(conversations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    markAsRead = async (req, res) => {
        try {
            await this.messageService.markAsRead(req.body.messageIds, req.user._id);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    getMessageHistory = async (req, res) => {
        try {
            const messages = await this.messageService.getMessageHistory(
                req.user._id,
                req.params.recipientId
            );
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    deleteMessage = async (req, res) => {
        try {
            const { messageId } = req.params;
            const userId = req.user; // ID do usuário que está tentando deletar

            const result = await this.messageService.deleteMessage(messageId, userId);
            
            if (result.success) {
                res.status(200).json({ 
                    success: true, 
                    message: 'Mensagem deletada com sucesso',
                    deletedMessageId: messageId
                });
            } else {
                res.status(403).json({ 
                    success: false, 
                    message: 'Você não tem permissão para deletar esta mensagem' 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Erro ao deletar mensagem',
                error: error.message 
            });
        }
    };
} 