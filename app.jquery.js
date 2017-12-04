var matrix;
var $table;


function updateCode() {
	$('#_output').show();
	var bytes = generateByteArray();
	var output = "unsigned char logo[504] =\n{\n" + bytes + "\n};"
	$('#_output').html(output);
}


function generateByteArray() {
	var width = matrix[0].length;
	var height = matrix.length;
	var buffer = new Array(width * height);
	var bytes = new Array((width * height) / 8);

	var temp;
	var bits = 0;

	// Refer to page 8 of datasheet on data addressing
	//(https://www.sparkfun.com/datasheets/LCD/Monochrome/Nokia5110.pdf)
	for (var row = 0; row < height; row+=8) {
		for (var x = 0; x < width; x++) {
			// get 8 bits from each row vertically
			for (var y = row; y < row+8; y++) {
				temp = matrix[y][x];
				//rearrange the data into a horizontal stream
				buffer[bits++] = temp;
			}
		}

	}

	// Read buffer 8-bits at a time
	// and turn it into bytes
	for (var i = 0; i < buffer.length; i+=8) {
		var newByte = 0;
		for (var j = 0; j < 8; j++) {
			if (buffer[i+j]) {
				newByte |= 1 << j;
			}
		}
		bytes[i / 8] = newByte;
	}

	var formatted = bytes.map(function (x) {
		x = x + 0xFFFFFFFF + 1;  // twos complement
		x = x.toString(16); // to hex
		x = ("0"+x).substr(-2); // zero-pad to 8-digits
		x = "0x" + x;
		return x;
	}).join(', ');

	return formatted;
}


function toggle(e) {
	var x = $(this).data('i');
	var y = $(this).data('j');

	if (navigator.userAgent.search("Firefox") > 0) {
		if (e.buttons == 1) {
			matrix[x][y] = 1;
			$(this).addClass('on');
		}
		else if (e.buttons == 2) {
			matrix[x][y] = 0;
			$(this).removeClass('on');
		}
	}
	else {
		if (e.which == 1) {
			matrix[x][y] = 1;
			$(this).addClass('on');
		}
		else if (e.which == 3) {
			matrix[x][y] = 0;
			$(this).removeClass('on');
		}
	}
	return false;
}


function populateTable(table, rows, cells, content) {
	if (!table) table = document.createElement('table');
	for (var i = 0; i < rows; ++i) {
		var row = document.createElement('tr');
		for (var j = 0; j < cells; ++j) {
			row.appendChild(document.createElement('td'));
			$(row.cells[j]).data('i', i);
			$(row.cells[j]).data('j', j);
		}
		table.appendChild(row);
	}
	$table = $(table);
	return table;
}


function initOptions() {

	$('#clearButton').click(function() {
		matrix = createArray(matrix.length,matrix[0].length);
		updateTable();
		$('#_output').hide();
	});

	$('#generateButton').click(updateCode);
}


function updateTable() {
	var width = matrix[0].length;
	var height = matrix.length;

	$('#_grid').html('');
	$('#_grid').append(populateTable(null, height, width, ""));

	// event handlers
	$table.on("mousedown", "td", toggle);
	$table.on("mouseenter", "td", toggle);
	$table.on("dragstart", function() {
		return false;
	});
}


// (height, width)
function createArray(length) {
	var arr = new Array(length || 0), i = length;

	if (arguments.length > 1) {
		var args = Array.prototype.slice.call(arguments, 1);
		while(i--)
			arr[length-1 - i] = createArray.apply(this, args);
	}

	return arr;
}


$(function() {
	matrix = createArray(48, 84);	// 48 rows x 84 cols dot matrix
	updateTable();
	initOptions();
	$('#_output').hide();
});
