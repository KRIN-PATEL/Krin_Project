const User = require('../model/usermodel');
const bcrypt = require('bcrypt');

// Render the login page
exports.getLogin = (req, res) => {
    res.render('login', { errorMessage: null });
};

// Authenticate user based on username and password
exports.postLogin = async (req, res) => {
    try {
        const { username, password } = req.body; // Getting username and password from the request body

        // Find user by username
        const user = await User.findOne({ username });

        // Check if user exists
        if (!user) {
            return res.render('login', { errorMessage: 'Unable to find user' });
        }

        // Compare entered password with hashed password in database
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render('login', { errorMessage: 'Incorrect password' });
        }

        // Store user and userType in session
        req.session.user = user;
        req.session.userType = user.userType;

        console.log('UserType:', req.session.userType);

        // Check if the user's details are in their default state
        const isDefaultData = user.firstName === 'DefaultFirstName' &&
            user.lastName === 'DefaultLastName' &&
            user.licenceNumber === 'DefaultLicenceNumber' &&
            user.car_details.make === 'DefaultMake' &&
            user.car_details.model === 'DefaultModel' &&
            user.car_details.year === 0 &&
            user.car_details.platno === 'DefaultPlatNo';

        // Redirect based on userType and default data status
        if (user.userType === 'Admin') {
            console.log('Redirecting to /appointment');
            return res.redirect('/appointment');
        } else if (user.userType === 'Examiner') {
            console.log('Redirecting to /examiner');
            return res.redirect('/examiner');
        } else if (isDefaultData && user.userType === 'Driver') {
            console.log('Redirecting to /g2');
            return res.redirect('/g2');
        } else if (user.userType === 'Driver') {
            console.log('Redirecting to /dashboarddriver');
            return res.redirect('/dashboarddriver');
        } else {
            console.log('Redirecting to /');
            return res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.render('login', { errorMessage: 'Error logging in' });
    }
};
