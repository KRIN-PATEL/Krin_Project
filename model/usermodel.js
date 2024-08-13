const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const Appointment = require('./appointmentmodel');

const usermodelSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true },
    testType: { type: String, enum: ['G', 'G2'], default: null },
    firstName: { type: String, default: 'default' },
    lastName: { type: String, default: 'default' },
    licenceNumber: { type: String, default: 'default' },
    age: { type: Number, default: 0 },
    dob: { type: String, default: 'default' },
    car_details: {
        make: { type: String, default: 'default' },
        model: { type: String, default: 'default' },
        year: { type: Number, default: 0 },
        platno: { type: String, default: 'default' }
    },
    g2Appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    gAppointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    appointmentsHistory: [{ type: Schema.Types.ObjectId, ref: 'Appointment' }],
    comment: { type: String, default: '' },
    passedTest: { type: Boolean, default: null }, // Updated this line to set default to null
    passedG2Test: { type: Boolean, default: false },
    passedGTest: { type: Boolean, default: false }  
});

usermodelSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    bcrypt.hash(user.password, 5, (error, hash) => {
        if (error) return next(error);
        user.password = hash;
        next();
    });
});

const UserModel = mongoose.model('usermodel', usermodelSchema);
module.exports = UserModel;
