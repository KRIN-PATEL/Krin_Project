const Appointment = require('../model/appointmentmodel');
const User = require('../model/usermodel');

exports.getG2 = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const user = await User.findById(userId).populate([
            {
                path: 'g2Appointment',
                model: 'Appointment'
            },
            {
                path: 'appointmentsHistory',
                model: 'Appointment'
            }
        ]);

        if (!user) {
            console.error('User not found');
            return res.status(404).send('User not found');
        }

        const date = req.query.date || '';
        let slots = [];
        if (date) {
            slots = await Appointment.find({ date, isTimeSlotAvailable: true }).select('time -_id');
        }

        res.render('g2', { user, slots, date });
    } catch (error) {
        console.error('Error while retrieving information from DB:', error);
        res.render('g2', { error: 'Error while retrieving information from DB!!' });
    }
};

exports.postG2 = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        const { appointmentDate, slot, firstName, lastName, licenceNumber, age, dob, make, model, year, platno } = req.body;

        if (appointmentDate && slot) {
            if (user.g2Appointment) {
                return res.status(400).send('You have already booked a G2 appointment.');
            }

            const appointment = await Appointment.findOne({ date: appointmentDate, time: slot });

            if (appointment && appointment.isTimeSlotAvailable) {
                appointment.isTimeSlotAvailable = false;
                await appointment.save();

                user.g2Appointment = appointment._id;
                user.testType = 'G2'; 
                user.passedTest = null; 
                user.comment = ''; 
                await user.save();

                req.session.alertMessage = 'G2 Appointment booked successfully!';
                return res.redirect('/g2');
            } else {
                return res.status(400).send('Selected time slot is not available. Try another slot.');
            }
        }

        // Update personal and car details
        user.firstName = firstName;
        user.lastName = lastName;
        user.licenceNumber = licenceNumber;
        user.age = age;
        user.dob = dob;
        user.car_details.make = make;
        user.car_details.model = model;
        user.car_details.year = year;
        user.car_details.platno = platno;
        await user.save();

        res.redirect('/g2');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error!');
    }
};
