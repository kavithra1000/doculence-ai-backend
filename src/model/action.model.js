import mongoose from 'mongoose';

const actionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        require: true,
    },
    content: {
        type: String,
        require: true,
    },
    summary: {
        type: String,
        require: true,
    },
}, {
    timestamps: true,
});

const Actions = mongoose.model('Actions', actionSchema);
export default Actions;