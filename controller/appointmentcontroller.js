
const User = require('../model/usermodel');
const Appointment = require('../model/appointmentmodel');

exports.getAppointmentsForDate = async (req, res) => {
    try {
        const date = req.query.date;
        if (!date) {
            return res.status(400).send('enter valid date!');
        }

        const appointments = await Appointment.find({ date }).select('time -_id');
        const times = appointments.map(app => app.time);
        res.send(times.join(','));
    } catch (error) {
        res.status(500).send('Error while fetching appointments');
    }
};

exports.getPassFailCandidates = async (req, res) => {
    try {
        const candidates = await User.find({ passedTest: { $ne: null } })
            .select('firstName lastName testType passedTest comment')
            .exec();

        res.json(candidates);
    } catch (error) {
        console.error('Error fetching pass/fail candidates:', error);
        res.status(500).send('Error fetching pass/fail candidates');
    }
};

exports.createAppointment = async (req, res) => {
    try {
        if (req.session.userType !== 'Admin') {
            return res.redirect('/');
        }

        const { date, slots } = req.body;
        if (!date || !slots) {
            return res.status(400).send('Date or slots not provided');
        }

        const timeSlots = slots.split(',');
        const existingAppointments = await Appointment.find({
            date,
            time: { $in: timeSlots }
        });

        if (existingAppointments.length > 0) {
            return res.status(400).send('Some time slots are already booked');
        }

        const appointments = timeSlots.map(time => ({ date, time }));
        await Appointment.insertMany(appointments);

        res.redirect('/appointment?success=true');
    } catch (error) {
        res.status(500).send('Error creating appointment slots');
    }
};
