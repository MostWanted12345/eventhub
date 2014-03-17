$(document).ready(function(){

	$("#lighbox").hide();
	$("#lighbox-shadow").hide();

	$("#lighbox .close").click(function(){
		$("#lighbox").fadeOut(150);
		$("#lighbox-shadow").fadeOut(150);
	});

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
							html += '<img src="http://graph.facebook.com/' + obj.id + '/picture?type=square&width=75&height=75"/>';
							html += '<span>' + gender_data.percentil + '%<br/><small>(' + gender_data.qtd + ')</small></span></div>';
							html += '<div class="clearfix"></div>';
							html += '<div class="lbinfo" style="display:none;">';
							html += '<span class="lbid">' + obj.id + '</span>';
							html += '<span class="lbgender">' +gender_data.percentil+'|'+gender_data.qtd+'</span>';
							html += '<span class="lbuserid">'
							gender_data.list.forEach(function(id){
								html += id + '|';
							});
							html = html.slice(0,-1)
							html += '</span><span class="lbtitle">' +obj.name+ '</span></div></div>';
							$("#eventhub-table").append(html);
							
						//	counter++;
						//}, 750*counter);
					});	
					$("#eventhub-table").append("<div class=\"clearfix\"></div>");	

					$(".eventhub-table-row").click(function(){
						lightbox($(this).find(".lbinfo"));
					});	
				}
		    });

		}, 750);
	});
});
var lightbox = function(obj){
	$("#lightbox .info").empty();

	var id = obj.find(".lbid").text();
	var gender = obj.find(".lbgender").text().split("|");
	var gender_percentil = gender[0];
	var gender_qtd = gender[1];
	var title = obj.find(".lbtitle").text();
	var pplid = obj.find(".lbuserid").text().split("|");

//<span>' + gender_percentil + '%<br/><small>(' + gender_qtd + ')</small></span>
	var html = '<a href="https://www.facebook.com/events/' + id + '/" target="_blank">';
	html += '<h3>' + title + '</h3></a></a>';
	pplid.forEach(function(id){
		html += '<a target="_blank" href="http://www.facebook.com/' + id + '">';
		html += '<img src="http://graph.facebook.com/' + id + '/picture?type=square&width=96&height=96"/></a>';	
	});

	$("#lighbox .info").append(html);	
	$("#lighbox .info").append("<div class=\"clearfix\"></div>");


	$("#lighbox").fadeIn(500);
	$("#lighbox-shadow").fadeIn(500);
}

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