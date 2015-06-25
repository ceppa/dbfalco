function menu_items_list_click()
{
	listItemsButton_Click(false);
}

function menu_items_search_click()
{
	listItemsButton_Click(true);
}

function listItemsButton_Click(search)
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
			url: 'include/items.php',
			params: [{name:'op',value:'list'}],
			dataType: 'json',
			showToggleBtn: false,
			colModel : 
			[
				{
					display: 'Description', 
					name : 'description', 
					width : 170, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Licence Name', 
					name : 'licence_name', 
					width : 80, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'P/N',
					name : 'pn', 
					width : 80, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Licence Type',
					name : 'licence_types.description', 
					width : 100, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Licence Number',
					name : 'licence_number', 
					width : 80, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Qty', 
					name : 'qty', 
					width : 30, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Serial Number', 
					name : 'sn', 
					width : 80, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Property',
					name : 'owners.description', 
					width : 100, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Fleet', 
					name : 'fleet', 
					width : 80, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Place', 
					name : 'place', 
					width : 80, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Location', 
					name : 'location', 
					width : 80, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Position', 
					name : 'position', 
					width : 80, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'BSD', 
					name : 'bsd.description', 
					width : 200, 
					sortable : true, 
					align: 'left'
				}
			],
			buttons : 
			[
				{
					name: 'Edit', 
					bclass: 'edit', 
					onpress : itemsEdit
				},
				{
					name: 'Move', 
					bclass: 'move', 
					onpress : itemsMove
				},
				{
					name: 'Details', 
					bclass: 'details', 
					onpress : itemsDetails
				},
				{
					separator: true
				}			
			],
			searchitems : 
			[
				{
					display: 'P/N', 
					name : 'parts.pn', 
					isdefault: true
				},
				{
					display: 'Description', 
					name : 'parts.description'
				},
				{
					display: 'S/N', 
					name : 'items_grouped.sn'
				},
				{
					display: 'Location', 
					name : 'location'
				},
				{
					display: 'Position', 
					name : 'position'
				},
				{
					display: 'Fleet', 
					name : 'fleet.description'
				},
				{
					display: 'Place', 
					name : 'places.name'
				},
				{
					display: 'Licence type', 
					name : 'licence_types.description'
				},
				{
					display: 'Property', 
					name : 'owners.description'
				},
				{
					display: 'Repair', 
					name : 'to_repair'
				}
			],
			onSuccess: function()
			{	
//				$(".bDiv").height("auto");
			},
			sortname: "fleet.description,places.name,parts.pn",
			sortorder: "asc",
			usepager: true,
			singleSelect: true,
			useRp: true,
			rp: 100,
			rpOptions: [100, 200, 300, 400],
			qtype: "parts.pn",
			query: (search?"ß":""),
			width: 'auto',
			height: 'auto',
			onRowSelected:items_row_selected,
			onRowSelectedClick:items_row_selected_click
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



function items_row_selected(itemId,row,grid)
{
	flexiItemId=itemId;
	$('.edit').show();
	$('.move').show();
	$('.details').show();
	$('.delete').show();
}

function items_row_selected_click(itemId,row,grid)
{
	itemsEdit();
}


function itemsDelete()
{
}

function itemsMove()
{
	$("#jd_menu li").removeClass("active");
	$("#jd_movements").addClass("active");
	movementsAdd(flexiItemId);
}


function itemsDetails()
{
	showWait();
	$.post('include/items.php', { op: "details", id:  flexiItemId}, 
		function(data) 
		{
			var id=flexiItemId.substr(3);
			data=getData(data);
			var item=data.item[id];
			var movements=data.movements;


			$('#div_main').html($('<div>').addClass('detail_div'));

			$('<input>').prop("type","button")
					.prop("class","cancel")
					.val("close")
					.click(function()
					{
						showDiv("div_flexi");
					}).appendTo($(".detail_div"));

			$('<table>').append(
				$('<tr>').append($('<td>').text('item details').attr('colspan',2)).addClass('header'),
				$('<tr>').append(
					$('<td>').text("pn"),$('<td>').text(item.pn)),
				$('<tr>').append(
					$('<td>').text("licence number"),$('<td>').text(item.licence_number)),
				$('<tr>').append(
					$('<td>').text("licence name"),$('<td>').text(item.licence_name)),
				$('<tr>').append(
					$('<td>').text("description"),$('<td>').text(item.description)),
				$('<tr>').append(
					$('<td>').text("sn"),$('<td>').text(item.sn)),
				$('<tr>').append(
					$('<td>').text("place"),$('<td>').text(item.place)),
				$('<tr>').append(
					$('<td>').text("bsd"),$('<td>').text(item.bsd))
			).appendTo($(".detail_div")).addClass("header_table");


			$('<table>').append(
				$('<tr>').append($('<td>').text('item movements').attr('colspan',6)).addClass('header'),
				$('<tr>').append(
					$('<td>').text("date"),
					$('<td>').text("from"),
					$('<td>').text("to"),
					$('<td>').text("location"),
					$('<td>').text("position"),
					$('<td>').text("bsd")).addClass('header')
				).appendTo($(".detail_div")).attr('id','detail_table');

			$.each(movements, function(i, movement) 
			{
				$('<tr>').append(
					$('<td>').text(movement.date),
					$('<td>').text(movement.place_from),
					$('<td>').text(movement.place_to),
					$('<td>').text(movement.location),
					$('<td>').text(movement.position),
					$('<td>').text(movement.bsd)
				).appendTo($("#detail_table"));

            });
				

			showDiv("div_main");
		});
}

function itemsEdit()
{
	showWait();
	$.post('include/items.php', { op: "edit", id:  flexiItemId}, 
		function(data) 
		{
			data=getData(data);
			var qty=data.qty;

			$('#div_main').html(data.form);
			$('#editform input[name="sn"]').change(itemsSnChange);

			var bsd=$('#editform select[name="id_bsd"]');
			var bsdOptions=bsd.find("option");

			bsdOptions.each(function()
			{
				if(typeof(data.addon[this.value])!="undefined")
					$(this).remove();
			});

			if((bsd.length>0)&&(bsd.find("option").length==1))
				bsd.find("option").text("---");
			pnRow="<tr><td class='right'>pn</td>"+
										"<td class='left' colspan='2'>"+data.header.pn+"</td></tr>"+
									"<tr><td class='right'>description</td>"+
										"<td class='left' colspan='2'>"+data.header.description+"</td></tr>";
			if(qty>0)
				pnRow+='<tr>'+
							'<td class="right">records to edit</td>'+
							'<td class="left" colspan="2">'+
								'<input type="text" name="qty" id="qty" class="text_class" value="'+qty+'" size="10" maxlength="10">'+
							'</tr>';
			
			$($('.form tr')[1]).after(pnRow);
			$("#qty").ForceNumericOnly().ForceLimit($("#qty").val());


			$('#submit').bind('click', items_form_submit);
			$('#cancel').bind('click', items_form_cancel);
			showDiv("div_main");
			$('#editform input[name="sn"]').trigger( "change" );

		});
}

function itemsSnChange(e)
{
	this.value=$.trim(this.value);
	var bsd=$('#editform select[name="id_bsd"]');
	if(bsd.length>0)
	{
		if(this.value.length)
			bsd.closest("tr").show(); 
		else
		{
			bsd.val(0);
			bsd.closest("tr").hide(); 
		}
	}
}

function items_form_submit()
{
	var notnull=new Array();
	var magzero=new Array();

	var ok=form_validate(notnull,magzero);
	ok=ok&&items_form_validate();
	if(ok)
	{
		form_post("items","editform","include/items.php");
//		form_post("items");
		$(".flexme").flexReload();
		resetButtons();
		showDiv("div_flexi");
	}
}


function items_form_validate()
{
	var out=true;
	if($("#qty").length==1)
	{
		if(Number($("#qty").val())==0)
		{
			$("#qty").addClass("error");
			out=false;
		}
		else
			$("#qty").removeClass("error");
	}
	return out;
}


function items_form_cancel()
{
	showDiv("div_flexi");
}

