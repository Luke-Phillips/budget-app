const express = require('express');
const app = express();
const controller = require('./controllers/controller.js');

const port = process.env.PORT || 5000;

var session = require('express-session');
app.use(session({
  secret: 'timsfmrraogt',
  resave: false,
  saveUninitialized: true
}))

app.use(express.json() );
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(function(req, res, next){
	if(!req.session.r_id || !req.session.h_id){
		console.log('middleware setting sesh vars');
		req.session.r_id = 1;
	  	req.session.h_id = 1;
	  }
	  	next();
})

app.post('/login', controller.handleLogin);
app.post('/createAccount', controller.handleCreateAccount);

app.get('/getHeader', controller.handleGetHeader);
app.get('/getTable', controller.handleGetTable);
app.post('/incTask', controller.handleIncTask);
app.post('/resetTask', controller.handleResetTask);
app.post('/addTask', controller.handleAddTask);

app.listen(port, function(){
	console.log(`listening on port ${port}`);
});