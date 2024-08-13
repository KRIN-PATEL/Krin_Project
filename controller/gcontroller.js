const Appointment = require('../model/appointmentmodel');
const User = require('../model/usermodel');

exports.getG = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const user = await User.findById(userId).populate('gAppointment');

        if (!user) {
            return res.render('g', { error: 'User not found', date: '' });
        }

        if (!user.passedG2Test) {
            return res.render('g', { user, error: 'You must pass the G2 test before booking a G test.', date: '' });
        }

        const date = req.query.date || ''; 
        let slots = [];
        if (date) {
            slots = await Appointment.find({ date, isTimeSlotAvailable: true }).select('time -_id');
        }

        res.render('g', { user, slots, date, error: null }); 
    } catch (error) {
        console.error('Error while extracting user information:', error);
        res.render('g', { user: null, slots: [], date: '', error: 'Error while extracting information about the user!!' });
    }
};

exports.postG = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.render('g', { error: 'User not found', date: '' });
        }

        if (!user.passedG2Test) {
            return res.render('g', { user, error: 'You must pass the G2 test before booking a G test.', date: '' });
        }

        const { appointmentDate, slot, firstName, lastName, licenceNumber, age, dob, make, model, year, platno } = req.body;

        if (appointmentDate && slot) {
            const appointment = await Appointment.findOne({ date: appointmentDate, time: slot });

            if (appointment && appointment.isTimeSlotAvailable) {
               
                appointment.isTimeSlotAvailable = false;
                await appointment.save();

                
                if (user.gAppointment) {
                    user.appointmentsHistory.push(user.gAppointment);
                }

                user.gAppointment = appointment._id;
                user.testType = 'G'; 
                user.passedTest = null; 
                await user.save();

                req.session.alertMessage = 'G Appointment booked successfully!';
                return res.redirect('/g');
            } else {
                return res.render('g', { user, error: 'Selected time slot is not available. Try another slot.', date: appointmentDate });
            }
        }

        // Update user details if needed
        user.firstName = firstName;
        user.lastName = lastName;
        user.licenceNumber = licenceNumber;
        user.age = age;
        user.dob = dob;
        user.car_details.make = make;
        user.car_details.model = model;
        user.car_details.year = year;
        user.car_details.platno = platno;
        user.testType = 'G'; 
        await user.save();

        res.redirect('/g');
    } catch (error) {
        console.error('Error while processing the request:', error);
        res.render('g', { user, error: 'Error while processing your request.', date: '' });
    }
};




// Update car details
exports.updateCarDetails = async (req, res) => {
    try {
        const { licenceNumber, make, model, year, platno } = req.body;

        const user = await User.findOne({ licenceNumber });
        if (user) {
            user.car_details.make = make;
            user.car_details.model = model;
            user.car_details.year = year;
            user.car_details.platno = platno;

            await user.save();
            res.status(200).json({ message: 'Car details updated successfully!' });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error updating car details:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
