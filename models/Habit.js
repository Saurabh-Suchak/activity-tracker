const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    flagtod: {
        type: Boolean,
        required:true,
        default:false
    },

    flagtom: {
        type: Boolean,
        required:true,
        default:false
    },

    email: {
        type: String,
        required: true
    },
    trying:[{
        type:Boolean,
        required:true
    }],
    dates: [{
        date: String,
        complete: String
    }],
    
}, {
    timestamps: true
});

const Habit = mongoose.model('Habit', HabitSchema);

module.exports = Habit;