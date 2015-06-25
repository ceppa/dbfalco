function menu_fleet_list_click()
{
	listFleetButton_Click(false);
}

function menu_fleet_search_click()
{
	listFleetButton_Click(true);
}

function listFleetButton_Click(search)
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
			url: 'include/fleet.php',
			params: [{name:'op',value:'list'}],
			dataType: 'json',
			showToggleBtn: false,
			colModel : 
			[
				{
					display: 'Description', 
					name : 'fleet.description', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Operator', 
					name : 'fleet.operator', 
					width : 150, 
					sortable : true, 
					align: 'left'
				}
			],
			buttons : 
			[
				{
					name: 'Add', 
					bclass: 'add', 
					onpress : fleetAdd
				},
				{
					name: 'Edit', 
					bclass: 'edit', 
					onpress : fleetEdit
				},
				{
					name: 'Delete', 
					bclass: 'delete', 
					onpress : fleetDelete
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
					display: 'Operator', 
					name : 'operator'
				}
			],
			onSuccess: function()
			{
//				$(".bDiv").height("auto");
			},
			sortname: "fleet.description",
			sortorder: "asc",
			usepager: true,
			singleSelect: true,
			useRp: true,
			rp: 15,
			qtype: "description",
			query: (search?"ß":""),
			width: 'auto',
			height: 'auto',
			onRowSelected:fleet_row_selected,
			onRowSelectedClick:fleet_row_selected_click
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



function fleet_row_selected(itemId,row,grid)
{
	flexiItemId=itemId;
	$('.edit').show();
	$('.delete').show();
}

function fleet_row_selected_click(itemId,row,grid)
{
	fleetEdit();
}


function menu_fleet_new_click()
{
	listUavButton_Click(false);
	fleetAdd();
}


function fleetDelete()
{
	if(confirm("Really delete fleet?"))
	{
		showWait();
		$.post('include/fleet.php', { op: "delete", id:  flexiItemId}, 
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

function fleetAdd()
{
	showWait();
	$.post('include/fleet.php', { op: "add"}, 
		function(data) 
		{
			$('#div_main').html(data);
			$('#submit').bind('click', fleet_form_submit);
			$('#cancel').bind('click', fleet_form_cancel);
			showDiv("div_main");
		});
}


function fleetEdit()
{
	showWait();
	$.post('include/fleet.php', { op: "edit", id:  flexiItemId}, 
		function(data) 
		{
			$('#div_main').html(data);
			$('#submit').bind('click', fleet_form_submit);
			$('#cancel').bind('click', fleet_form_cancel);
			showDiv("div_main");
		});
}

function fleet_form_submit()
{
	var notnull=new Array("description","operator");
	var magzero=new Array();

	var ok=form_validate(notnull,magzero);
	if(ok)
	{
		
		form_post("fleet");
		$(".flexme").flexReload();
		resetButtons();
		showDiv("div_flexi");
	}
}


function fleet_form_cancel()
{
	if($("#active_flexi").val()!="fleet")
		listFleetButton_Click(false);
	else
		showDiv("div_flexi");
}


