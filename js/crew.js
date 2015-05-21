function menu_crew_list_click()
{
	listCrewButton_Click(false);
}

function menu_crew_search_click()
{
	listCrewButton_Click(true);
}

function listCrewButton_Click(search)
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
			url: 'include/crew.php',
			params: [{name:'op',value:'list'}],
			dataType: 'json',
			showToggleBtn: false,
			colModel : 
			[
				{
					display: 'Name', 
					name : 'crew.name', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Active', 
					name : 'crew.active', 
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
					onpress : crewAdd
				},
				{
					name: 'Edit', 
					bclass: 'edit', 
					onpress : crewEdit
				},
				{
					name: 'Delete', 
					bclass: 'delete', 
					onpress : crewDelete
				},
				{
					separator: true
				}			
			],
			searchitems : 
			[
				{
					display: 'Name', 
					name : 'name',
					isdefault: true
				}
			],
			onSuccess: function()
			{
				$(".bDiv").height("auto");
			},
			onReply: flexiReply,
			sortname: "crew.name",
			sortorder: "asc",
			usepager: true,
			singleSelect: true,
			useRp: true,
			rp: 15,
			qtype: "name",
			query: (search?"ß":""),
			width: 'auto',
			onRowSelected:crew_row_selected,
			onRowSelectedClick:crew_row_selected_click
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



function crew_row_selected(itemId,row,grid)
{
	flexiItemId=itemId;
	$('.edit').show();
	$('.delete').show();
}

function crew_row_selected_click(itemId,row,grid)
{
	crewEdit();
}


function crew_new_click()
{
	listUavButton_Click(false);
	crewAdd();
}


function crewDelete()
{
	if(confirm("Really delete item?"))
	{
		showWait();
		$.post('include/crew.php', { op: "delete", id:  flexiItemId}, 
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

function crewAdd()
{
	showWait();
	$.post('include/crew.php', { op: "add"}, 
		function(data) 
		{
			$('#div_main').html(data);
			$('#submit').bind('click', crew_form_submit);
			$('#cancel').bind('click', crew_form_cancel);
			showDiv("div_main");
		});
}


function crewEdit()
{
	showWait();
	$.post('include/crew.php', { op: "edit", id:  flexiItemId}, 
		function(data) 
		{
			$('#div_main').html(data);
			$('#submit').bind('click', crew_form_submit);
			$('#cancel').bind('click', crew_form_cancel);
			showDiv("div_main");
		});
}

function crew_form_submit()
{
	var notnull=new Array("description","ICAO","IATA");
	var magzero=new Array();

	var ok=form_validate(notnull,magzero);
	if(ok)
	{
		
		form_post("crew");
		$(".flexme").flexReload();
		resetButtons();
		showDiv("div_flexi");
	}
}


function crew_form_cancel()
{
	if($("#active_flexi").val()!="crew")
		listCrewButton_Click(false);
	else
		showDiv("div_flexi");
}


