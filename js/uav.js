function menu_uav_list_click()
{
	listUavButton_Click(false);
}

function menu_uav_search_click()
{
	listUavButton_Click(true);
}

function listUavButton_Click(search)
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
			url: 'include/uav.php',
			params: [{name:'op',value:'list'}],
			dataType: 'json',
			showToggleBtn: false,
			colModel : 
			[
				{
					display: 'Tipo', 
					name : 'uav_type.description', 
					width : 200, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Flotta', 
					name : 'fleet.description', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Marche', 
					name : 'uav.marche', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Part Number', 
					name : 'uav.pn', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Serial Nuber', 
					name : 'uav.sn', 
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
					onpress : uavAdd
				},
				{
					name: 'Edit', 
					bclass: 'edit', 
					onpress : uavEdit
				},
				{
					name: 'Delete', 
					bclass: 'delete', 
					onpress : uavDelete
				},
				{
					separator: true
				}			
			],
			searchitems : 
			[
				{
					display: 'Marche', 
					name : 'uav.marche'
				},
				{
					display: 'Flotta', 
					name : 'fleet.description',
					isdefault: true
				},
				{
					display: 'Part Number', 
					name : 'uav.pn'
				},
				{
					display: 'Serial Number', 
					name : 'uav.sn'
				}
			],
			onSuccess: function()
			{	
//				$(".bDiv").height("auto");
			},
			onReply: flexiReply,
			sortname: "uav.marche",
			sortorder: "asc",
			usepager: true,
			singleSelect: true,
			useRp: true,
			rp: 15,
			qtype: "uav.marche",
			query: (search?"ß":""),
			width: 'auto',
			height: 'auto',
			onRowSelected:uav_row_selected,
			onRowSelectedClick:uav_row_selected_click
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



function uav_row_selected(itemId,row,grid)
{
	flexiItemId=itemId;
	$('.edit').show();
	$('.delete').show();
}

function uav_row_selected_click(itemId,row,grid)
{
	uavEdit();
}

function menu_uav_new_click()
{
	listUavButton_Click(false);
	uavAdd();
}


function uavDelete()
{
}

function uavAdd()
{
	showWait();
	$.post('include/uav.php', { op: "add"}, 
		function(data) 
		{
			$('#div_main').html(data);
			$('#submit').bind('click', uav_form_submit);
			$('#cancel').bind('click', uav_form_cancel);
			showDiv("div_main");
		});
}


function uavEdit()
{
	showWait();
	$.post('include/uav.php', { op: "edit", id:  flexiItemId}, 
		function(data) 
		{
			$('#div_main').html(data);
			$('#submit').bind('click', uav_form_submit);
			$('#cancel').bind('click', uav_form_cancel);
			showDiv("div_main");
		});
}

function uav_form_submit()
{
	var notnull=new Array("sn","marche","pn");
	var magzero=new Array("id_fleet","uav_type_id");

	var ok=form_validate(notnull,magzero);
	if(ok)
	{
		
		form_post("uav");
		$(".flexme").flexReload();
		resetButtons();
		showDiv("div_flexi");
	}
}


function uav_form_cancel()
{
	showDiv("div_flexi");
}

