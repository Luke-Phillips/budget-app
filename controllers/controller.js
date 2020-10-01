const model = require('../models/model.js');

function handleLogin(req, res){

}

function handleCreateAccount(req, res){
	model.checkForUsername(req, function(checkResult){
		if (checkResult.usernameExists == true){
			console.log('User Already Exists');
			const result = {
				createSuccess: false,
				loginSuccess: false,
				err: 'User already exists'
			}
			res.json(result);
		} else {
			console.log('User Does Not Exist');
			model.insertNewRoommate(req, function(insertResult){
				if(insertResult.success == false){
					console.log('insertNewRoommate failed');
					const result = {
						createSuccess: false,
						loginSuccess: false,
						err: 'Failed to create new account'
					}
					res.json(result);
				} else {
					console.log('insertNewRoommate succeeded');
					model.getRoommateId(req, function(getResult){
						if (getResult.success == false){
							console.log('getRoommateId failed');
							const result = {
								createSuccess: true,
								loginSuccess: false,
								err: 'Account Created, Login Failed'
							}
							res.json(result);
						} else {
							console.log(getResult.id);
							req.session.r_id = getResult.id;
							const result = {
								createSuccess: true,
								loginSuccess: true
							}
							//res.redirect(__dirname + )
							res.json(result);
						}
					});
				}
			});
		}
	});
}

function handleGetHeader(req, res){

	model.getHeaderData(req, function(err, dbHeaderData){
		if (err){
			const headerData = {
				success: false,
				message: err
			};
		}
		else {
			const headerData = {
				success: true,
				dbHeaderData: dbHeaderData
			};
			
			res.json(headerData);
		}
	});
}

function handleGetTable(req, res){

	// get tasks
	var taskData;
	model.getTableData(req, function(err){
		if (err){
			throw err;
		} else {
			res.json(req.session.tableData);
		}
	});
}

function handleIncTask(req, res){
	model.incTaskData(req, function(err){
		res.json({success: true});
	});
}

function handleResetTask(req, res){
	model.resetTaskData(req, function(err){
		if (err){
			res.json({success: false});
		} else {
			res.json({success: true});
		}
	});
}

function handleAddTask(req, res){
	model.getHouseholdData(req, res, addTask);
}


function addTask(req, res, result){
	if (!result.getSuccess){
		console.log('getSuccess failed');
	} else if (!result.updateSuccess){
		console.log('updateSuccess failed');
	} else {
		console.log('get and update were successful');
		var householdData = {
			nextCol: result.nextCol,
			num_rows: result.num_rows
		}
		model.addTaskData(req, res, householdData, addHouseTask);
	}
}

function addHouseTask(req, res, householdData, result){
	if (!result.success){
		// handle err
		console.log('adding task data was unsuccessful');
	} else {
		model.addHouseTaskData(req, res, householdData, 1);
	}
}

module.exports =
{
	handleLogin: handleLogin,
	handleCreateAccount: handleCreateAccount,
	handleGetHeader: handleGetHeader,
	handleGetTable: handleGetTable,
	handleIncTask: handleIncTask,
	handleResetTask: handleResetTask,
	handleAddTask: handleAddTask
};