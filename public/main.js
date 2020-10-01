
document.addEventListener('DOMContentLoaded', function(e) {
	const header = document.getElementById('header');
	var mouseDownTarget;
	var timeMousedown;
	var timeMouseup;
	var buttonRow;
	var buttonCol;
	var buttonTimesDone;
});

document.addEventListener('mousedown', function(e){
	if (e.target.className == 'tableButton'){
		mouseDownTarget = e.target;
		timeMousedown = Date.now();
		e.target.className = 'longPress';
		buttonRow = e.target.row;
		buttonCol = e.target.col;
		buttonTimesDone = e.target.timesDone;
	}
});

document.addEventListener('mouseup', function(e){
	if (e.target.className == 'longPress' &&
			e.target.row == buttonRow &&
			e.target.col == buttonCol){
		
		timeMouseup = Date.now();
		e.target.className = 'tableButton';
		var timeElapsed = timeMouseup - timeMousedown;
		if (timeElapsed > 500){
			resetTask(e.target);
		}
		else {
			incTask(e.target);
		}
	}
	else if (typeof mouseDownTarget !== 'undefined'){
		mouseDownTarget.className = 'tableButton';
	}
});

function loadPage(){
	getHeaderNames();
	getTable();
}

function getHeaderNames(){
	var req = new XMLHttpRequest();
	target = '/getHeader';
	req.onreadystatechange = function(){
		if (req.readyState == 4 && req.status == 200){
			headerData = JSON.parse(req.responseText);
			h_name = headerData['dbHeaderData']['h_name'];
			r_name = headerData['dbHeaderData']['r_name'];
			document.getElementById('h_name').textContent = h_name;
			document.getElementById('r_name').textContent = r_name;
		}
	}
	req.open('GET', target);
	req.send();
}

function getTable(){
	var tableDom = document.getElementById('table');

	var req = new XMLHttpRequest();
	target = '/getTable';
	req.onreadystatechange = function(){
		if (req.readyState == 4 && req.status == 200){
			
			const tableData = JSON.parse(req.responseText);

			///// Generate Table /////
			var table = document.getElementById('table');
			table.innerHTML = ""; // clear existing table

			var num_roommates = tableData.rowColData['num_roommates'];
			var num_tasks = tableData.rowColData['num_tasks'];
			var num_rows = num_roommates + 1;
			var num_cols = num_tasks + 1;

			var row;
			var th;
			var td;

			// Render All Cells
			for (var i = 0; i < num_rows; i++){

				row = document.createElement('tr');

				for (var j = 0; j < num_cols; j++){
					
					// top left blank cell and timesDone cells
					if ((i > 0 && j > 0) || (i == 0 && j == 0)){
						td = document.createElement('td');
						row.appendChild(td);
					}

					// task and roommate headings
					else {
						th = document.createElement('th');
						row.appendChild(th);
					}
				}

				table.appendChild(row);
			}

			// Populate Headings ...
			var rows = table.childNodes;
			var columns;

			// ... for tasks
			columns = rows[0].childNodes
			for (var i = 0; i < tableData.taskData.length; i++){
				col_num = tableData.taskData[i]['col'];
				columns[col_num].textContent = tableData.taskData[i]['t_name'];
			}

			// ... for roommates
			for (var i = 0; i < tableData.roommateData.length; i++){
				row_num = tableData.roommateData[i]['row'];
				rows[row_num].childNodes[0].textContent =
					tableData.roommateData[i]['r_name'];
			}

			// Populate with 'Times Done' Data		
			var button;	
			for (var i = 0; i < tableData.cellData.length; i++){

				if (tableData.cellData[i]['timesdone'] == null){
					tableData.cellData[i]['timesdone'] = 0;
				}
				button = document.createElement('button');
				button.row = tableData.cellData[i]['roommate_row'];
				button.col = tableData.cellData[i]['task_col'];
				button.timesDone = tableData.cellData[i]['timesdone'];
				button.className = 'tableButton';
				button.textContent = tableData.cellData[i]['timesdone'];
				rows[tableData.cellData[i]['roommate_row']].childNodes[tableData.cellData[i]['task_col']].appendChild(button);
			}
		}
	}

	req.open('GET', target);
	req.send();
}

function incTask(button){
	var newTimesDone = buttonTimesDone + 1;

	const params = {
		row_num: buttonRow,
		col_num: buttonCol,
		timesDone: newTimesDone
	}

	$.post('/incTask', params, function(result){
		if (result && result.success){
			
			button.textContent = newTimesDone;
			button.timesDone = newTimesDone;
		}
	});
}

function resetTask(button){
	const params = {
		row_num: buttonRow,
		col_num: buttonCol
	}

	$.post('/resetTask', params, function(result){
		if (result && result.success){
			button.textContent = 0;
			button.timesDone = 0;
		} else {
			console.log('failed to reset');
		}
	})
}

function addTask(){
	if ($('#newTask').length != 0){
		$('#addTaskDiv').css('display', 'none');
		$('#loadMsg').css('display', 'block');
		var newTask = $('#newTask').val();
		const params = {
			newTask: newTask
		}
		$.post('/addTask', params, function(result){
			if (!result.success){
				console.log('add task failed');
			} else {
				getTable();
				$('#newTask').val('');
				$('#addTaskDiv').css('display', 'block');
				$('#loadMsg').css('display', 'none');
			}
		})
	}
}

/*function test(testParam){
	console.log(`test: ${testParam}`);
}*/