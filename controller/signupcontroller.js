// In controller/signupcontroller.js

const User = require('../model/usermodel');

// Render the signup page
exports.getSignup = (req, res) => {
    res.render('signup', { errorMessage: null });
};

// Logic for user signup and saving with default values
exports.postSignup = async (req, res) => {
    try {
        // Get data from the request body
        const { username, password, pswConfirm, userType } = req.body;

        // Validate that the passwords match
        if (password !== pswConfirm) {
            return res.render('signup', { errorMessage: 'Passwords do not match' });
        }

        // Validate userType
        if (!['Driver', 'Examiner', 'Admin'].includes(userType)) {
            return res.render('signup', { errorMessage: 'Invalid user type' });
        }

        // Create a new user with default values
        const newUser = new User({
            username,
            password,
            userType,
            firstName: 'DefaultFirstName',
            lastName: 'DefaultLastName',
            licenceNumber: 'DefaultLicenceNumber',
            car_details: {
                make: 'DefaultMake',
                model: 'DefaultModel',
                year: undefined,
                platno: 'DefaultPlatNo'
            }
        });

        // Save the user to the database
        await newUser.save();

        // Redirect to the login page after signup
        res.redirect('/login');

    } catch (error) {
        console.error(error);
        res.render('signup', { errorMessage: 'Error while signing up user' });
    }
};
