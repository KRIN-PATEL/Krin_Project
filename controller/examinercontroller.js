const User = require('../model/usermodel');

exports.getExaminerDashboard = (req, res) => {
    res.render('examiner', { errorMessage: null });
};

exports.getAppointmentsByTestType = async (req, res) => {
    try {
        const testType = req.query.testType;
        let query = {
            $or: [
                { g2Appointment: { $exists: true } },
                { gAppointment: { $exists: true } }
            ]
        };

        if (testType) {
            query.testType = testType;
        }

        const users = await User.find(query)
            .populate('g2Appointment')
            .populate('gAppointment')
            .exec();

        res.json(users);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch appointments' });
    }
};

exports.updateDriverTestResult = async (req, res) => {
    try {
        const { driverId, comment, passedTest } = req.body;

        const user = await User.findById(driverId).populate('gAppointment').populate('g2Appointment');
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        if (user.testType === 'G' && user.gAppointment) {
            user.passedGTest = passedTest; 
            user.gAppointment = null; 
        } else if (user.testType === 'G2' && user.g2Appointment) {
            user.passedG2Test = passedTest; 
            user.g2Appointment = null; 
        } else {
            return res.status(400).send({ error: 'Test result cannot be updated without a valid appointment.' });
        }

        user.comment = comment; 
        user.passedTest = passedTest; 

       
        if (user.testType === 'G') {
            user.appointmentsHistory.push(user.gAppointment);
        } else if (user.testType === 'G2') {
            user.appointmentsHistory.push(user.g2Appointment);
        }

        await user.save();

        res.status(200).send({ message: 'Test result updated successfully' });
    } catch (error) {
        console.error('Error updating test result:', error);
        res.status(500).send({ error: 'Failed to update test result' });
    }
};
