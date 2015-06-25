function menu_places_list_click()
{
	listPlacesButton_Click(false);
}

function menu_places_search_click()
{
	listPlacesButton_Click(true);
}

function listPlacesButton_Click(search)
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
			url: 'include/places.php',
			params: [{name:'op',value:'list'}],
			dataType: 'json',
			showToggleBtn: false,
			colModel : 
			[
				{
					display: 'Name', 
					name : 'places.name', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Description', 
					name : 'places.description', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Place type', 
					name : 'places.place_type', 
					width : 100, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Fleet', 
					name : 'fleet', 
					width : 100, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Address', 
					name : 'places.address', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Contact Name', 
					name : 'places.contact_name', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Contact email', 
					name : 'places.contact_email', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Active', 
					name : 'places.enabled', 
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
					onpress : placesAdd
				},
				{
					name: 'Edit', 
					bclass: 'edit', 
					onpress : placesEdit
				},
				{
					name: 'Delete', 
					bclass: 'delete', 
					onpress : placesDelete
				},
				{
					separator: true
				}			
			],
			searchitems : 
			[
				{
					display: 'Name', 
					name : 'places.name'
				},
				{
					display: 'Description', 
					name : 'places.description'
				},
				{
					display: 'Place Type', 
					name : 'places_type.name'
				}
			],
			onSuccess: function()
			{	
//				$(".bDiv").height("auto");
			},
			sortname: "places.name",
			sortorder: "asc",
			usepager: true,
			singleSelect: true,
			useRp: true,
			rp: 15,
			qtype: "places.name",
			query: (search?"ß":""),
			width: 'auto',
			height: 'auto',
			onRowSelected:places_row_selected,
			onRowSelectedClick:places_row_selected_click
		}
	);
	showDiv("div_flexi");
	resetButtons();
	if(search)
	{
		$('.sDiv').show();
		$('.qsbox').focus();
	}
	else
		$('.sDiv').hide();
}



function places_row_selected(itemId,row,grid)
{
	flexiItemId=itemId;
	$('.edit').show();
//	$('.delete').show();
}

function places_row_selected_click(itemId,row,grid)
{
	placesEdit();
}

function menu_places_new_click()
{
	listPlacesButton_Click(false);
	placesAdd();
}


function placesDelete()
{
}

function placesAdd()
{
	showWait();
	$.post('include/places.php', { op: "add"}, 
		function(data) 
		{
			data=getData(data);
			$('#div_main').html(data.form);
			$('#submit').bind('click', places_form_submit);
			$('#cancel').bind('click', places_form_cancel);
			showDiv("div_main");
		});
}


function placesEdit()
{
	showWait();
	$.post('include/places.php', { op: "edit", id:  flexiItemId}, 
		function(data) 
		{
			data=getData(data);
			$('#div_main').html(data.form);
			$('#submit').bind('click', places_form_submit);
			$('#cancel').bind('click', places_form_cancel);
			showDiv("div_main");
		});
}

function places_form_submit()
{
	var notnull=new Array("name","description");
	var magzero=new Array("id_places_types","id_fleet");

	var ok=form_validate(notnull,magzero);
	if(ok)
	{
		form_post("places");
		$(".flexme").flexReload();
		resetButtons();
		showDiv("div_flexi");
	}
}


function places_form_cancel()
{
	showDiv("div_flexi");
}

