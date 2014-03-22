var open_wtf = false;
var open_about = false;

$(document).mouseup(function(e){
    var wtf_lb = $("#eventhub-wtf");
    if (!wtf_lb.is(e.target) && wtf_lb.has(e.target).length === 0)
	{wtf_lb.fadeOut(100); open_wtf = false; setTimeout(function(){wtf_lb.css("margin-top","0px");}, 120);}

	var about_lb = $("#eventhub-about");
    if (!about_lb.is(e.target) && about_lb.has(e.target).length === 0)
	{about_lb.fadeOut(100); open_about = false; setTimeout(function(){about_lb.css("margin-top","0px");}, 120); }
});

var open_lb = function(lb_name){
	lb_name.animate({
		"margin-top": "+=100px",
		"opacity": "1"
	}, 250).fadeIn();
}

var close_lb = function(ln_name){
	ln_name.animate({
		"margin-top": "-=100px",
		"opacity": "0"
	}, 250)
	setTimeout(function(){ ln_name.css("display", "none"); }, 250);
}

$(document).ready(function(){

	$("#eventhub-about").hide();
	$("#eventhub-wtf").hide();

	// WTF lightbox manipulation
	$(".eventhub-wtf-trigger").click(function(){
		if(!open_wtf){
			open_wtf = true;
			open_lb($("#eventhub-wtf"));
		}
	});
	$(".eventhub-wtf-close").click(function(){
		open_wtf = false;
		close_lb($("#eventhub-wtf"));
	});


	// ABOUT lightbox manipulation
	$(".eventhub-about-trigger").click(function(){
		if(!open_about){
			open_about = true;
			open_lb($("#eventhub-about"));
		}
	});
	$(".eventhub-about-close").click(function(){
		open_about = false;
		close_lb($("#eventhub-about"));
	});


	$(".eventhub-trigger").click(function(){

		var gender = $(this).data("gender");

		$("#eventhub-welcome").animate({
			"margin-top": "-=100px",
			"opacity": "0"
		}, 750);

		// estilo do footer todo martelado! ksafoda
		$("#eventhub-footer").fadeOut(750);
		$("#eventhub-header").fadeOut(750);
		setTimeout(function(){
			$("#eventhub-footer").fadeIn(750);
			$("#eventhub-header").fadeIn(750);
		}, 1250);

		// ink-grid div disapears from screen and
		// then the event table shows
		setTimeout(function(){
			$("#eventhub-table h1 b").text($("#city").val());
			$("#eventhub-welcome").css("display", "none");
			$("#eventhub-table").animate({
				"margin-top": "+=25px"
			}, 250).fadeIn();

			// get array with events
			$.ajax({
		        url : '/api?c='+$("#city").val(),
		        dataType : "json",
		        type: "GET",
		        success : function(data){

					// Sort by highest rate
					data.sort(function(a,b){
						if(gender == "female")
							return b.p_male - a.p_male;
						else
							return b.p_female - a.p_female;
					});

					var counter = 0;
					data.forEach(function(obj){

						counter += 1;

						var gender_data;
						switch(gender){
							case "male" : gender_data = do_male(obj); break;
							case "female" : gender_data = do_female(obj); break;
							case "wtf" : gender_data = do_wtf(obj); break;
							default : gender_data = do_nothing(obj); break;
						}

						if(gender_data.error === true)
							return false;

						var name = (obj.name.length > 55) ? obj.name.substring(0, 70) : obj.name;
						var selected = (counter == 1) ? "checked" : "";
						var html = '<div>';
						html += '<input id="ac-'+counter+'" name="accordion-1" type="checkbox" '+selected+' />';
						html += '<label for="ac-'+counter+'">';
						html += '<a href="https://www.facebook.com/events/'+obj.id+'/" target="_blank">';
						html += '<img src="http://graph.facebook.com/'+obj.id+'/picture?type=square&width=75&height=75"/>';
						html += '<h3>'+name+'</h3>';
						html += '</a>';
						html += '<span>'+gender_data.percentil+'%<br/><small>('+gender_data.qtd+')</small></span>';
						html += '</label>';
						html += '<article class="ac-small">';
						html += '<p>get creeping...</p>';
						html += '<div>';
						gender_data.list.forEach(function(id){
							html += '<a target="_blank" href="http://www.facebook.com/'+id+'">';
							html += '<img src="http://graph.facebook.com/'+id+'/picture?type=square&width=75&height=75"/>';
							html += '</a>';
						});
						html += '</div>';
						html += '</article>';
						html += '</div>';

						console.log(html);
						$("#eventhub-table-wrapper").append(html);

					});
				}
		    });

		}, 750);
	});
});

// var lightbox = function(obj){
// 	var id = obj.find(".lbid").text();
// 	var gender = obj.find(".lbgender").text().split("|");
// 	var gender_percentil = gender[0];
// 	var gender_qtd = gender[1];
// 	var title = obj.find(".lbtitle").text();
// 	var pplid = obj.find(".lbuserid").text().split("|");

// //<span>' + gender_percentil + '%<br/><small>(' + gender_qtd + ')</small></span>
// 	var html = '<a href="https://www.facebook.com/events/' + id + '/" target="_blank">';
// 	html += '<h3>' + title + '</h3></a></a>';
// 	pplid.forEach(function(id){
// 		html += '<a target="_blank" href="http://www.facebook.com/' + id + '">';
// 		html += '<img src="http://graph.facebook.com/' + id + '/picture?type=square&width=96&height=96"/></a>';
// 	});

// 	$("#lighbox .info").append(html);
// 	$("#lighbox .info").append("<div class=\"clearfix\"></div>");


// 	$("#lighbox").fadeIn(500);
// 	$("#lighbox-shadow").fadeIn(500);
// }


var do_female = function(obj){
	return { "percentil" : obj.p_male, "qtd" : obj.male + " boys" , "list" : obj.list_male, "error" : false};
}

var do_male = function(obj){
	return { "percentil" : obj.p_female, "qtd" : obj.female + " girls", "list" : obj.list_female, "error" : false};
}

var do_wtf = function(obj){
	console.log("LOL");
	return { "error" : true };
}

var do_nothing = function(obj){
	console.log("WHAT ARE YOU TRYING TO DO UHN?!\nGive us a call if you reach this page.. we'll buy you a beer just for the efford! ;)")
	return { "error" : true };
}
