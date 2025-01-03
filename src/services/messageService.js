import { Message } from '../models/Message.js';
import { User } from '../models/usersModel.js';

export class MessageService {
    async sendMessage(data) {
        try {
            const message = await Message.create({
                senderId: data.senderId,
                recipientId: data.recipientId,
                content: data.content
            });
            
            return message;
        } catch (error) {
            throw new Error('Error sending message: ' + error.message);
        }
    }

    async getConversations(userId) {
        try {
            const messages = await Message.find({
                $or: [
                    { senderId: userId },
                    { recipientId: userId }
                ]
            })
            .sort({ timestamp: -1 })
            .populate('senderId', 'name image')
            .populate('recipientId', 'name image')
            .populate('deletedBy', '_id name');

            const conversations = {};
            for (const message of messages) {
                const otherUserId = message.senderId.equals(userId) 
                    ? message.recipientId 
                    : message.senderId;
                
                if (!conversations[otherUserId]) {
                    const otherUser = await User.findById(otherUserId);
                    conversations[otherUserId] = {
                        otherParticipant: otherUser,
                        messages: [],
                        unreadCount: 0
                    };
                }

                // Formatar a mensagem com o prefixo correto
                let messageContent = message.content;
                const isMine = message.senderId._id.toString() === userId.toString();
                const prefix = isMine ? "Você: " : `${message.senderId.name}: `;

                if (message.deleted) {
                    const wasDeletedByMe = message.deletedBy?._id.toString() === userId.toString();
                    messageContent = wasDeletedByMe 
                        ? "Você excluiu esta mensagem"
                        : `${message.senderId.name} excluiu esta mensagem`;
                } else {
                    messageContent = prefix + messageContent;
                }
                
                conversations[otherUserId].messages.push({
                    ...message.toObject(),
                    content: messageContent
                });

                if (!message.read && message.recipientId.equals(userId)) {
                    conversations[otherUserId].unreadCount++;
                }
            }

            return Object.values(conversations);
        } catch (error) {
            throw new Error('Error fetching conversations: ' + error.message);
        }
    }

    async markAsRead(messageIds, recipientId) {
        try {
            await Message.updateMany(
                { 
                    _id: { $in: messageIds },
                    recipientId: recipientId
                },
                { $set: { read: true } }
            );
            return true;
        } catch (error) {
            throw new Error('Error marking messages as read: ' + error.message);
        }
    }

    async getMessageHistory(userId, recipientId) {
        try {
            const messages = await Message.find({
                $or: [
                    { senderId: userId, recipientId: recipientId },
                    { senderId: recipientId, recipientId: userId }
                ]
            })
            .sort({ timestamp: 1 })
            .populate('senderId', 'name image')
            .populate('recipientId', 'name image')
            .populate('deletedBy', '_id');
            
            const formattedMessages = messages.map(msg => {
                const messageObj = msg.toObject();
                
                if (messageObj.deleted) {
                    // Verificar quem deletou a mensagem
                    const wasDeletedByMe = messageObj.deletedBy?._id.toString() === userId.toString();
                    const iAmSender = messageObj.senderId._id.toString() === userId.toString();

                    if (wasDeletedByMe) {
                        messageObj.content = "Você excluiu esta mensagem";
                    } else {
                        messageObj.content = `${messageObj.senderId.name} excluiu esta mensagem`;
                    }
                }
                
                return messageObj;
            });
            
            return formattedMessages;
        } catch (error) {
            throw new Error('Error fetching message history: ' + error.message);
        }
    }

    async deleteMessage(messageId, userId) {
        try {
            const message = await Message.findById(messageId);
            
            if (!message) {
                throw new Error('Mensagem não encontrada');
            }

            if (message.senderId.toString() !== userId.toString()) {
                return { success: false, message: 'Sem permissão para deletar esta mensagem' };
            }

            const updatedMessage = await Message.findByIdAndUpdate(
                messageId,
                { 
                    deleted: true,
                    deletedBy: userId
                },
                { new: true }
            );

            return { 
                success: true, 
                message: 'Mensagem deletada com sucesso',
                deletedMessageId: messageId,
                deletedBy: userId
            };
        } catch (error) {
            throw new Error('Erro ao deletar mensagem: ' + error.message);
        }
    }
} 