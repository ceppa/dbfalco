var flexiItemId=false;

jQuery.fn.ForceNumericOnly =
function()
{
    return this.each(function()
    {
        $(this).keydown(function(e)
        {
            var key = e.charCode || e.keyCode || 0;
            // allow backspace, tab, delete, enter, arrows, numbers and keypad numbers ONLY
            // home, end, period, and numpad decimal
            return (
				(e.keyCode == 65 && e.ctrlKey === true) ||
                key == 8 ||
                key == 9 ||
                key == 13 ||
                key == 46 ||
                key == 110 ||
                key == 190 ||
                (key >= 35 && key <= 40) ||
                (key >= 48 && key <= 57) ||
                (key >= 96 && key <= 105));
        });
    });
};

jQuery.fn.ForceLimit =
function(limit)
{
    return this.each(function()
    {
        $(this).change(function(e)
        {
			if(Number(this.value)>Number(limit))
				this.value=limit;
        });
    });
};


function initMenu()
{
	$("#jd_menu li ul li").each(function()
	{
		$(this).unbind("click");
		$(this).click(function()
			{
				var menuToActivate=$(this).parent().parent().attr("id");
				var menuModuleName=$(this).attr("id");
				runModule(menuToActivate,menuModuleName);
			});
	});
}

function runModule(menuToActivate,menuModuleName)
{
	$("#QtbUavSelect").remove();
	$("#jd_menu li").removeClass("active");
	$("#"+menuToActivate).addClass("active");
//	var func=menuModuleName+"_click()";
	var func=menuModuleName+"_click";
	try
	{
		// find object
		var fn = window[func];

		// is object a function?
		if (typeof fn === "function") fn();
//		eval(func);
	}
	catch(e)
	{
		alert(func+" "+e.message);
		$('#div_main').html("");
		showDiv("main");
	}
}

function main()
{
	display_admin_nav();
	show_headers(true);
	initMenu();
	runModule("jd_items","menu_items_list");
}

function show_headers(doshow)
{
	if(doshow)
	{
		$('#header').show();
		$('#admin_nav').show();
	}
	else
	{
		$('#header').hide();
		$('#admin_nav').hide();
	}
}

function notify(status,message)
{
	if(message.length)
		if(status==0)
			messagebox(message);
		else
			errorbox(message);
}

function messagebox(message)
{
	$("#messageBox").css("height","40px");
	$("#messageBox").removeClass().addClass("messagebox").stop(true).hide().html(message).slideDown(1000).delay(3000).slideUp(2000);
}
function errorbox(message)
{
	$("#messageBox").css("height","40px");
	$("#messageBox").removeClass().addClass("errorbox").stop(true).hide().html(message).slideDown(2000).delay(3000).slideUp(2000);
}



function initAjax()
{
	$("body").ajaxError
	(
		function(event, request, settings)
		{
			//Debug, must remove for release
			alert(
				"QUESTO E' UN ERRORE AJAX\n\n"
				+ settings.url
				+ "\n\n"
				+ request.responseText
				+ event.message
			); 
		}
	);
}

$(document).ready(
	function()
	{
		initAjax();
		auth();
		$("#messageBox").hide();
		$("#messageBox").click(function()
			{
				$("#messageBox").stop(true, true);
			});
		var globalKeep=setInterval(function(){$.ajax({url:'include/keepalive.php'})},600000);
	}
)

function display_admin_nav()	//async
{
	$.ajax({
			type:'POST',
			url:'include/main.php',
			data:{ op: "display_admin_nav" },
			cache: false,
			async: false
		}).done(function(data)
			{
				$('#admin_nav').html(data);
				$("ul.jd_menu").jdMenu({showDelay:0,hideDelay:0});
			});
}


function showWait(otherDiv)
{
	otherDiv = typeof otherDiv !== 'undefined' ? ","+otherDiv : "";
	showDiv("div_wait"+otherDiv);
}

function showDiv(divToShow)
{
	var divToShowArray=divToShow.split(",");
	$('[id^=div_]').each(function()
		{
			if($.inArray(this.id,divToShowArray)==-1)
				$(this).hide();
			else
				$(this).show();
		});
}


function getData(data)
{
	try
	{
		var data=jQuery.parseJSON(data);
	}
	catch(e)
	{
		alert(data);
		data="";
	}
	return(data?data:"");
}

function isEmail(email)
{
	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
}

function resetButtons()
{
	$('.edit').hide();
	$('.move').hide();
	$('.delete').hide();
	$('.details').hide();
	$('.reset').hide();
}

function hideModal()
{
	$("#boxes").remove();
}


function showModal()
{
	var modal='<div id="boxes">'+
		'<div id="mask">'+
		'</div>'+
		'<div id="dialog">'+
		'</div>'+
		'</div>';

	$("body").append(modal);

	var maskHeight = $(document).height();
    var maskWidth = $(window).width();
    $('#mask').css({'width':maskWidth,'height':maskHeight});
	$('#mask').fadeTo("fast",0.8);
    $('#dialog').show();
}


function flexiReply(e)
{
	if(!e)
	{
		errorbox("empty answer: session expired?");
		return false;
	}
	return true;
}

function getSessionValue(variable)
{
	var params=[];
	var out=false;
	params.push({name: 'op',value :'getSessionValue'});
	params.push({name: 'variable',value :variable});

	 $.ajax({
			url: "include/main.php",
			data: params,
			type: "post",
			async: false,
			success: function(data)
			{
				out=data;
			}
		});
	return out;
}
