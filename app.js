var matrix;


function updateCode() {
	document.getElementById('_output').style.display = 'block';
	var bytes = generateByteArray();
	var output = "unsigned char logo[504] =\n{\n" + bytes + "\n};"
	document.getElementById('_output').innerHTML = output;
}


function generateByteArray() {
	var width = matrix[0].length;
	var height = matrix.length;
	var buffer = new Array(width * height);
	var bytes = new Array((width * height) / 8);

	var temp;
	var bits = 0;

	// Refer to page 8 of datasheet on data addressing
	//(https://www.e-tinkers.com/wp-content/uploads/2017/11/PCD8544_Controller_Datasheet.pdf)
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
	x = e.target.getAttribute('data-i');
	y = e.target.getAttribute('data-j');

  if (navigator.userAgent.search("Firefox") > 0) {
		if (e.buttons == 1) {
			matrix[x][y] = 1;
  		e.target.classList.add('on');
		}
		else if (e.buttons == 2) {
			matrix[x][y] = 0;
			e.target.classList.remove('on');
		}
	}
	else {
		if (e.which == 1) {
			matrix[x][y] = 1;
			e.target.classList.add('on');
		}
		else if (e.which == 3) {
			matrix[x][y] = 0;
			e.target.classList.remove('on');
		}
	}
	return false;
}


function populateTable(table, rows, cells, content) {
    if (!table) table = document.createElement('table');
    for (var i = 0; i < rows; ++i) {
        var row = document.createElement('tr');
        for (var j = 0; j < cells; ++j) {
					var cell = document.createElement('td');
					cell.setAttribute("data-i", i);
					cell.setAttribute("data-j", j);
					row.appendChild(cell);
        }
        table.appendChild(row);
    }
    return table;
}


function initOptions() {
	document.getElementById('clearButton').addEventListener('click', function() {
		matrix = createArray(matrix.length, matrix[0].length);
		updateTable();
		document.getElementById('_output').style.display = 'none';
	});

	document.getElementById('generateButton').addEventListener('click', function() {
		updateCode();
	});
}


function updateTable() {
	var width = matrix[0].length;
	var height = matrix.length;

	document.getElementById('_grid').innerHTML='';
	var dom = populateTable(null, height, width, "");
	document.getElementById('_grid').appendChild(dom);

	// event handlers
	document.addEventListener("mousedown", function(event) {
		if (event.target.tagName == 'TD') {
			toggle(event);
		}
	});

	document.addEventListener("mouseover", function(event) {
		if (event.target.tagName == 'TD') {
			toggle(event);
		}
	});

	document.addEventListener("dragstart", function(event) {
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


(function() {
  matrix = createArray(48, 84);	// 48 rows x 84 cols dot matrix
  updateTable();
	initOptions();
  document.getElementById('_output').style.display = 'none';
})();
