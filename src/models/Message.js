import mongoose from 'mongoose';
import { User } from './usersModel.js';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async function(v) {
                const user = await User.findById(v);
                return user != null;
            },
            message: 'Usuário remetente não encontrado'
        }
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async function(v) {
                const user = await User.findById(v);
                return user != null;
            },
            message: 'Usuário destinatário não encontrado'
        }
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000 // Limite de 5000 caracteres
    },
    read: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Adiciona createdAt e updatedAt
});

// Índices para melhorar a performance das consultas
messageSchema.index({ senderId: 1, recipientId: 1 });
messageSchema.index({ timestamp: -1 });

export const Message = mongoose.model('Message', messageSchema); 