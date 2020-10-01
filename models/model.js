const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const saltRounds = 10;
require('dotenv').config();
const db_url = process.env.DATABASE_URL;
const pool = Pool({connectionString: db_url});

function checkForUsername(req, callback){

	var sql = 'SELECT username FROM roommate WHERE username = $1::text';
	var params = [req.body.username];
	pool.query(sql, params, function(err, db_result){
	
		if (db_result.rows.length){
			const result = {
				usernameExists: true
			}
			callback(result);
		} else {
			const result = {
				usernameExists: false
			}
			callback(result);
		}
	});
}

function insertNewRoommate(req, callback){
	
	// hash password
	bcrypt.hash(req.body.password, saltRounds, function(err, hash){

		// insert 
		console.log('insert new roommate');
		console.log(`username is ${req.body.username}`);
		console.log(`hashed pw is ${hash}`);
		console.log(`name is ${req.body.name}`);

		var sql = 'INSERT INTO roommate(username, password, r_name) ' +
					'VALUES ($1::text, $2::text, $3::text)';
		var params = [req.body.username, hash, req.body.name];
		pool.query(sql, params, function(err, db_result){
			if (err){
				console.log('error inserting into db');
				const result = {
					success: false
				}
				callback(result);
			} else {
				console.log('success inserting into db');
				const result = {
					success: true
				}
				callback(result);		
			}
		});
	});
}

function getRoommateId(req, callback){
	console.log(req.body.username);
	var sql = 'SELECT id FROM roommate WHERE username = $1::text';
	var params = [req.body.username];
	pool.query(sql, params, function(err, db_result){
		console.log(db_result);
		if (err){
			console.log('err');
			const result = {
				success: false
			}
			callback(result);
		} else {
			const result = {
				success: true,
				id: db_result.rows[0]['id']
			}
			console.log(result);
			callback(result);
		}
	});
}

function getHeaderData(req, callback){

	var sql = 'SELECT h.h_name, r.r_name FROM houseMate AS hm ' +
				'JOIN roommate AS r ON (r.id = hm.roommate_id) ' +
				'JOIN household AS h ON (h.id = hm.household_id) ' +
				'WHERE r.id = $1::int AND h.id = $2::int';
	var params = [req.session.r_id, req.session.h_id];

	pool.query(sql, params, function(err, db_results){
		if (err) {
			throw err;
		} else {
			var dbHeaderData = {
				h_name:db_results.rows[0]['h_name'],
				r_name:db_results.rows[0]['r_name']
			}
			callback(err, dbHeaderData);
		}
	});
}

function getTableData(req, callback){
	getRowColData(req, callback);
}

function getRowColData(req, callback){
	
	var sql = 'SELECT num_roommates, num_tasks FROM household WHERE id = $1::int';
	var params = [req.session.h_id];

		pool.query(sql, params, function(err, db_results){
		if (err){
			throw err;
		} else {
			req.session.tableData = {
				rowColData: {
					num_roommates: db_results.rows[0]['num_roommates'],
					num_tasks: db_results.rows[0]['num_tasks']			
				}
			}

			getTaskData(req, callback);
		}
	});
}

function getTaskData(req, callback){
	
	var sql = 'SELECT t_name, col FROM task WHERE household_id = $1::int';
	var params = [req.session.h_id];

	pool.query(sql, params, function(err, db_results){
		if (err){
			throw err;
		} else {
			req.session.tableData.taskData = db_results.rows;
			getRoommateData(req, callback);
		}
	});
}

function getRoommateData(req, callback){
	
	var sql = 'SELECT r.r_name, hm.row FROM roommate AS r ' +
		'JOIN houseMate AS hm ON r.id = hm.roommate_id ' +
		'WHERE hm.household_id = $1::int';
	var params = [req.session.h_id];

	pool.query(sql, params, function(err, db_results){
		if (err){
			throw err;
		} else {
			req.session.tableData.roommateData = db_results.rows;
			getCellData(req, callback);
		}
	});
}

function getCellData(req, callback){
	
	var sql = 'SELECT roommate_row, task_col, timesDone ' +
		'FROM houseTask WHERE household_id = $1::int';
	var params = [req.session.h_id];

	pool.query(sql, params, function(err, db_results){
		if (err){
			throw err;
		} else {
			req.session.tableData.cellData = db_results.rows;
			callback(null);
		}
	});
}

function incTaskData(req, callback){

	var sql = 'UPDATE houseTask SET timesDone = $1::int ' + 
			'WHERE household_id = $2::int ' +
			'AND roommate_row = $3::int ' +
			'AND task_col = $4::int';

	const params = [req.body.timesDone,
					req.session.h_id,
					req.body.row_num,
					req.body.col_num];

	pool.query(sql, params, function(err, db_results){
		if (err){
			throw err;
		} else {
			callback(err);
		}
	});
}

function resetTaskData(req, callback){

	console.log('resetTaskData');
	var sql = 'UPDATE houseTask SET timesdone = 0 ' + 
			'WHERE household_id = $1::int ' +
			'AND roommate_row = $2::int ' +
			'AND task_col = $3::int';

	const params = [req.session.h_id,
					req.body.row_num,
					req.body.col_num];

	pool.query(sql, params, function(err, db_results){
		if (err){
			throw err;
		} else {
			callback(err);
		}
	});
}

function getHouseholdData(req, res, callback){
	console.log('getHouseholdData');
	var sql = 'SELECT num_tasks, num_roommates FROM household WHERE id = $1::int';
	var params = [req.session.h_id];
	pool.query(sql, params, function(err, db_result){
		if (err){
			console.log('getSuccess failed');
			const result = {
				getSuccess: false
			}
			callback(req, res, result);
		} else {
			var num_tasks = db_result.rows[0]['num_tasks'];
			var nextCol = ++num_tasks;
			var num_rows = db_result.rows[0]['num_roommates'];

			sql = 'UPDATE household SET num_tasks = $1::int ' +
					'WHERE id = $2::int';
			var params = [nextCol, req.session.h_id];
			pool.query(sql, params, function(err, db_result){
				if (err){
					console.log('updateSuccess failed');
					const result = {
						getSuccess: true,
						updateSuccess: false,
					}
					callback(req, res, result);
				} else {
					console.log('get and update succeeded');
					const result = {
						getSuccess: true,
						updateSuccess: true,
						nextCol: nextCol,
						num_rows: num_rows
					}
					callback(req, res, result);
				}
			})

		}
	});
}
function addTaskData(req, res, householdData, callback){
	var sql = 'INSERT INTO task (household_id, t_name, col) ' +
				'VALUES ($1::int, $2::text, $3::int) RETURNING id';
	const params = [req.session.h_id, req.body.newTask, householdData.nextCol];
	pool.query(sql, params, function(err, db_result){
		if (err){
			const result = {
				success: false
			}
			callback(req, res, householdData, result);
		} else {
			householdData.newTaskId = db_result.rows[0]['id'];
			const result = {
				success: true
			}
			callback(req, res, householdData, result);
		}
	});
}

function addHouseTaskData(req, res, householdData, i){

	var sql = 'INSERT INTO ' +
		'houseTask (household_id, task_id, roommate_row, task_col, timesDone) ' + 
		'VALUES ($1::int, $2::int, $3::int, $4::int, 0)';
	var params = [req.session.h_id, householdData.newTaskId, i, householdData.nextCol];
	pool.query(sql, params, function(err){
		if (err){
			console.log('error inserting houseTaskData');
			const result = {
				success: false
			}
			res.json(result);
		}
		else {
			++i;
			if (i > householdData.num_rows){
				const result = {
					success: true
				}
				res.json(result);
			} else {
				addHouseTaskData(req, res, householdData, i);
			}
		}
	});
}

module.exports =
{
	checkForUsername: checkForUsername,
	insertNewRoommate: insertNewRoommate,
	getRoommateId: getRoommateId,
	getHeaderData: getHeaderData,
	getTableData: getTableData,
	incTaskData: incTaskData,
	resetTaskData: resetTaskData,
	getHouseholdData: getHouseholdData,
	addTaskData: addTaskData,
	addHouseTaskData: addHouseTaskData
}