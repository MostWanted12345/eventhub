$(document).ready(function(){


	$(".eventhub-trigger").click(function(){

		var gender = $(this).data("gender");

		$(".ink-grid").animate({
			"margin-top": "-=100px",
			"opacity": "0"
		}, 750);

		// estilo do footer todo martelado! ksafoda
		$("#eventhub-footer").fadeOut(750);
		$("#eventhub-header").fadeOut(750);
		setTimeout(function(){
			$("#eventhub-footer").fadeIn(750);

			$("#eventhub-header small").css("color","#333");
			$("#eventhub-header").fadeIn(750);
		}, 1250);

		// ink-grid div disapears from screen and
		// then the event table shows
		setTimeout(function(){
			$(".ink-grid").css("display", "none");
			$("#eventhub-table").animate({
				"margin-top": "+=25px"
			}, 250).fadeIn();

			// get array with events
			$.ajax({
		        url : '/api',
		        dataType : "json",
		        type: "GET",
		        success : function(data){

					data.sort(function(a,b){
						if(gender == "female") {
							return b.p_male - a.p_male;
						} else {
							return b.p_female - a.p_female;
						}
					})

					//var counter = 0;
					data.forEach(function(obj){

						var gender_data;
						switch(gender){
							case "male" : gender_data = do_male(obj); break;
							case "female" : gender_data = do_female(obj); break;
							case "wtf" : gender_data = do_wtf(obj); break;
							default : gender_data = do_nothing(obj); break;
						}

						if(gender_data.error === true)
							return false;

						//setTimeout(function(){
							var html = '<div class="eventhub-table-row">';
							html += '<div class="eventhub-table-row-detail" class="large-100 medium-100 small-100">';
							html +=	'<a href="https://www.facebook.com/events/' + obj.id + '/" target="_blank"><img src="http://graph.facebook.com/' + obj.id + '/picture?type=square&width=75&height=75"/>';
							html += '<h3>' + obj.name + '</h3></a><span>' + gender_data.percentil + '%<br/><small>(' + gender_data.qtd + ')</small></span>';
							html += '</div>';
							html += '<div class="eventhub-table-row-ppl" class="large-100 medium-100 small-100">';
							gender_data.list.forEach(function(id){
								html += '<a target="_blank" href="http://www.facebook.com/' + id + '">';
								html += '<img src="http://graph.facebook.com/' + id + '/picture?type=square&width=75&height=75"/></a>';
							});

							html += '<a href="https://www.facebook.com/events/' + obj.id + '/" target="_blank"><small>...</small></div></a>';
							html += '<div class="clearfix"></div></div>';
							$("#eventhub-table").append(html);

						//	counter++;
						//}, 750*counter);
					});
				}
		    });

		}, 750);
	});
});


var do_female = function(obj){
	return { "percentil" : obj.p_male, "qtd" : obj.male + "boys" , "list" : obj.list_male, "error" : false};
}

var do_male = function(obj){
	return { "percentil" : obj.p_female, "qtd" : obj.female + "girls", "list" : obj.list_female, "error" : false};
}

var do_wtf = function(obj){
	console.log("LOL");
	return { "error" : true };
}

var do_nothing = function(obj){
	console.log("WHAT ARE YOU TRYING TO DO UHN?!\nGive us a call if you reach this page.. we'll buy you a beer just for the efford! ;)")
	return { "error" : true };
}
