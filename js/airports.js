function menu_airports_list_click()
{
	listAirportsButton_Click(false);
}

function menu_airports_search_click()
{
	listAirportsButton_Click(true);
}

function listAirportsButton_Click(search)
{
	showWait();

	flexiItemId = false;
	$("#form_container").hide();
	$("#flexi_container").show();
	$("#loading_container").hide();
	
	$(".flexigrid").remove();
	$("#div_flexi").append("<table class='flexme'></table>");
	$(".flexme").flexigrid
	(
		{
			url: 'include/airports.php',
			params: [{name:'op',value:'list'}],
			dataType: 'json',
			showToggleBtn: false,
			colModel : 
			[
				{
					display: 'Description', 
					name : 'airports.description', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'IATA', 
					name : 'airports.IATA', 
					width : 50, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'ICAO', 
					name : 'airports.ICAO', 
					width : 50, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Active', 
					name : 'airports.active', 
					width : 30, 
					sortable : true, 
					align: 'left'
				}
			],
			buttons : 
			[
				{
					name: 'Add', 
					bclass: 'add', 
					onpress : airportsAdd
				},
				{
					name: 'Edit', 
					bclass: 'edit', 
					onpress : airportsEdit
				},
				{
					name: 'Delete', 
					bclass: 'delete', 
					onpress : airportsDelete
				},
				{
					separator: true
				}			
			],
			searchitems : 
			[
				{
					display: 'Description', 
					name : 'description',
					isdefault: true
				},
				{
					display: 'IATA', 
					name : 'IATA'
				},
				{
					display: 'ICAO', 
					name : 'ICAO'
				}
			],
			onSuccess: function()
			{
				$(".bDiv").height("auto");
			},
			onReply: flexiReply,
			sortname: "airports.description",
			sortorder: "asc",
			usepager: true,
			singleSelect: true,
			useRp: true,
			rp: 15,
			qtype: "description",
			query: (search?"ß":""),
			width: 'auto',
			onRowSelected:airports_row_selected,
			onRowSelectedClick:airports_row_selected_click
		}
	);
	if(search)
	{
		$('.sDiv').show();
		$('.qsbox').focus();
	}
	else
		$('.sDiv').hide();
	showDiv("div_flexi");
	resetButtons();
}



function airports_row_selected(itemId,row,grid)
{
	flexiItemId=itemId;
	$('.edit').show();
	$('.delete').show();
}

function airports_row_selected_click(itemId,row,grid)
{
	airportsEdit();
}


function menu_airports_new_click()
{
	listUavButton_Click(false);
	airportsAdd();
}


function airportsDelete()
{
	if(confirm("Really delete airport?"))
	{
		showWait();
		$.post('include/airports.php', { op: "delete", id:  flexiItemId}, 
			function(data) 
			{
				data=getData(data);
				if(data.length==0)
					return;
				var status=parseInt(data.status);
				var message=data.message;
				notify(status,message);
				$(".flexme").flexReload();
				resetButtons();
				showDiv("div_flexi");
			});
	}
}

function airportsAdd()
{
	showWait();
	$.post('include/airports.php', { op: "add"}, 
		function(data) 
		{
			$('#div_main').html(data);
			$('#submit').bind('click', airports_form_submit);
			$('#cancel').bind('click', airports_form_cancel);
			showDiv("div_main");
		});
}


function airportsEdit()
{
	showWait();
	$.post('include/airports.php', { op: "edit", id:  flexiItemId}, 
		function(data) 
		{
			$('#div_main').html(data);
			$('#submit').bind('click', airports_form_submit);
			$('#cancel').bind('click', airports_form_cancel);
			showDiv("div_main");
		});
}

function airports_form_submit()
{
	var notnull=new Array("description","ICAO","IATA");
	var magzero=new Array();

	var ok=form_validate(notnull,magzero);
	if(ok)
	{
		
		form_post("airports");
		$(".flexme").flexReload();
		resetButtons();
		showDiv("div_flexi");
	}
}


function airports_form_cancel()
{
	if($("#active_flexi").val()!="airports")
		listAirportsButton_Click(false);
	else
		showDiv("div_flexi");
}


