$(document).ready(function(){
		

	$(".eventhub-trigger").click(function(){
		var gender = $(this).data("gender");
		switch(gender){
			case "male" : do_male(); break;
			case "female" : do_female(); break;
			case "wtf" : do_wtf(); break;
			default : do_nothing(); break;
		}

		$(".ink-grid").animate({
			"top": "-100px", 
			"opacity": "0" 
		}, 750);
	});


});

var do_male = function(){
	console.log("male");
}

var do_female = function(){
	console.log("female");
}

var do_wtf = function(){
	console.log("wtf");
}

var do_nothing = function(){
	console.log("WHAT ARE YOU TRYING TO DO UHN?!\nGive us a call if you reach this page.. we'll buy you a beer just for the efford! ;)")
}