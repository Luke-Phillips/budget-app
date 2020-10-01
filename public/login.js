function login(){
	// sanitize

	// send info
	$.post('/login', function(result){
		if (result && result.success){

		} else {
			
		}
	});
}

function createAccount(){

	var username = $('#createUsername').val();
	var password = $('#createPassword').val();
	var confirmPassword = $('#confirmPassword').val();
	var name = $('#name').val();
	
	// check to see if password match
	if (password != confirmPassword && password.length >= 6){
		console.log('passwords dont match');
		$('#status').text('Passwords must match and contain at least 6 characters');
	} else {
		console.log('passwords match');	
		console.log(username);
		console.log(password);

		// send info
		const params = {
			username: username,
			password: password,
			name: name
		}
		$.post('/createAccount', params, function(result){
			console.log('result createSuccess is ' + result.createSuccess);
			console.log('result loginSuccess is ' + result.loginSuccess);
			if (result.createSuccess && result.loginSuccess){
				console.log('about to redirect from client side');
				$.get('/joinCreateHousehold', function(result){

				});
			}
			else if (result.createSuccess) {
				
			}	
			else {

			}

		});
	}
}

function showCreateAccount(){
	var loginForm = $('#loginForm');
	var createAccountForm =	$('#createAccountForm');
	var loginLink = $('#loginLink');
	var createAccountLink =	$('#createAccountLink');

	loginForm.css('display', 'none');
	createAccountLink.css('display', 'none');	
	createAccountForm.css('display', 'block');
	loginLink.css('display', 'block');
}

function showLogin(){
	var loginForm = $('#loginForm');
	var createAccountForm =	$('#createAccountForm');
	var loginLink = $('#loginLink');
	var createAccountLink =	$('#createAccountLink');

	createAccountForm.css('display', 'none');
	loginLink.css('display', 'none');
	loginForm.css('display', 'block');
	createAccountLink.css('display', 'block');
}