function join(){
	var code = $('#code').val();
	const params = {
		code: code
	}
	//$.post('/joinHousehold', params)
}

function create(){

}

function showCreateHousehold(){
	var joinHouseholdForm =	$('#joinHouseholdForm');
	var createHouseholdForm = $('#createHouseholdForm');
	var joinHouseholdLink = $('#joinHouseholdLink');
	var createHouseholdLink = $('#createHouseholdLink');

	joinHouseholdForm.css('display', 'none');
	createHouseholdLink.css('display', 'none');
	createHouseholdForm.css('display', 'block');
	joinHouseholdLink.css('display', 'block');	
}

function showJoinHousehold(){
	var joinHouseholdForm =	$('#joinHouseholdForm');
	var createHouseholdForm = $('#createHouseholdForm');
	var joinHouseholdLink = $('#joinHouseholdLink');
	var createHouseholdLink = $('#createHouseholdLink');

	createHouseholdForm.css('display', 'none');
	joinHouseholdLink.css('display', 'none');	
	joinHouseholdForm.css('display', 'block');
	createHouseholdLink.css('display', 'block');
}