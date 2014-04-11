var fs = require('fs');
var fileJSON = require('./pagesFound.json');



var json = {};

for( key in fileJSON ){

	var data_array = [];
	var o_json = fileJSON[key];	
	var num_of_deleted = 0;

	for( value in o_json ){
		if(!isInArray(JSON.stringify(o_json[value]), data_array)){
			data_array.push(JSON.stringify(o_json[value]));
		} else {
			num_of_deleted += 1;	
		}
	}

	for(val in data_array){
		data_array[val] = JSON.parse(data_array[val]);
	}
	json[key] = data_array;
	console.log("In -> \""+ key +"\" was deleted " + num_of_deleted + " repeated objects ");


}
fs.writeFile("pagesFound.json", JSON.stringify(json, null, 2), function(err) {
	if(err)
		console.log(err);
	else
		console.log("The file was saved!");
});

function isInArray(value, array) { return array.indexOf(value) > -1; }
