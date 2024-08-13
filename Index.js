const express = require('express');
const path = require('path');
const app = express();
const ejs = require('ejs');
const mongoose = require('mongoose');
const usermodel = require("./model/usermodel");
const Appointment = require('./model/appointmentmodel');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { read } = require("fs");


// mongo connection
mongoose.connect('mongodb+srv://krinpatelinfo:Krinpatel%401552@cluster0.ghf3v1y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use('/public/css', express.static(path.join(__dirname, 'public', 'css')));
app.use(bodyParser.urlencoded({ extended: true }));
// session
app.use(session({
    secret: 'your_secret_key_here',
    resave: false,
    saveUninitialized: true,
}));

//importing controller from the controlleer folder
const loginController = require('./controller/logincontroller');
const signupController = require('./controller/signupcontroller');
const gController = require('./controller/gcontroller');
const g2Controller = require('./controller/g2controller');
const appointmentController = require('./controller/appointmentcontroller');
const examinerController = require('./controller/examinercontroller');

function restrictToExaminers(req, res, next) {
    if (req.session.userType === 'Examiner') {
        next();
    } else {
        res.redirect('/');
    }
}



app.get('/examiner', restrictToExaminers, examinerController.getExaminerDashboard);
app.get('/getAppointmentsByTestType', restrictToExaminers, examinerController.getAppointmentsByTestType);
app.post('/updateDriverTestResult', restrictToExaminers, examinerController.updateDriverTestResult);

// ejs link for the dashboard
app.get('/', (req, res) => {
    res.render('dashboard');
});

// ejs link for the dashboard driver it will be displayed when user login with type driver so all g2 and g pages will be display

app.get('/dashboarddriver', (req, res) => {
    res.render('dashboarddriver'); 
});

app.get('/mainnav', (req, res) => {
    res.render('mainnav'); 
});

app.get('/appointment', (req, res) => {
    res.render('appointment'); 
});

// get has logic that fetch data from the db and reflect it on ui so for example one time slot is selected for the 6:00 am it wiil be grey out and also cursor disabled 
app.get('/getAppointments', appointmentController.getAppointmentsForDate);
app.get('/getPassFailCandidates',appointmentController.getPassFailCandidates);
app.post('/createAppointment', appointmentController.createAppointment);


// render the login page with get and post logic in post it handle logic for checking username and password and also checking the login of user is it first time or secoond time 
app.get('/login', loginController.getLogin);
app.post('/login', loginController.postLogin);


// logic for signup page so when user sighup it will save user data and aslo encrypt the user data using bycrpt lib and also save user details with default value 
app.get('/signup', signupController.getSignup);
app.post('/signup', signupController.postSignup);



// it prevent other user type such as admin to prevent access to g and g2 page 
app.use((req, res, next) => {
    if (req.session.userType === 'Driver') {
        next(); 
    } else {
        res.redirect('/'); 
    }
});

// logic for the g where it display licence and user details based on the user session id and also conatain update car details from previous assignment where user can update car details 
app.get('/g', gController.getG);
app.post('/g', gController.postG);


// logic behind g2 page where user enter details like firstname , lastname and car details in it in first time login after second login all previous details are displayed in the g2 page using get request 
app.get('/g2', g2Controller.getG2);
app.post('/g2', g2Controller.postG2);

// logic for the updating car details in g page and saving to database s
app.post('/updateCarDetails', gController.updateCarDetails);

app.listen(1552, () => {
    console.log('App listening on port 1552');
});
