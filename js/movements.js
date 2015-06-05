function menu_movements_list_click()
{
	listMovementsButton_Click(false);
}

function menu_movements_search_click()
{
	listMovementsButton_Click(true);
}

function listMovementsButton_Click(search)
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
			url: 'include/movements.php',
			params: [{name:'op',value:'list'}],
			dataType: 'json',
			showToggleBtn: false,
			colModel :
			[
				{
					display: 'Date',
					name : 'movements.date',
					width : 100,
					sortable : true,
					align: 'left'
				},
				{
					display: 'From',
					name : 'places_from.name',
					width : 100,
					sortable : true,
					align: 'left'
				},
				{
					display: 'To',
					name : 'places_to.name',
					width : 100,
					sortable : true,
					align: 'left'
				},
				{
					display: 'PN',
					name : 'pn',
					width : 100,
					sortable : true,
					align: 'left'
				},
				{
					display: 'Description',
					name : 'parts.description',
					width : 200,
					sortable : true,
					align: 'left'
				},
				{
					display: 'SN',
					name : 'sn',
					width : 100,
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
					display: 'Note',
					name : 'movements.note',
					width : 150,
					sortable : true,
					align: 'center'
				},
				{
					display: 'Documents',
					name : 'documents.description',
					width : 100,
					sortable : true,
					align: 'left'
				}
			],
			buttons :
			[
				{
					name: 'Add',
					bclass: 'add',
					onpress : movementsAdd
				},
				{
					name: 'Edit',
					bclass: 'edit',
					onpress : movementsEdit
				},
				{
					name: 'Details',
					bclass: 'details',
					onpress : movementsDetails
				},
				{
					separator: true
				}
			],
			searchitems :
			[
				{
					display: 'Date',
					name : 'movements.date',
					isdefault: true
				},
				{
					display: 'From',
					name : 'places_from.name'
				},
				{
					display: 'To',
					name : 'places_to.name'
				},
				{
					display: 'PN',
					name : 'pn'
				},
				{
					display: 'SN',
					name : 'items.sn'
				},
				{
					display: 'Description',
					name : 'parts.description'
				},
				{
					display: 'Note',
					name : 'movements.note'
				}
			],
			onSuccess: function()
			{
//				$(".bDiv").height("auto");
			},
			onReply: flexiReply,
			sortname: "movements.date",
			sortorder: "desc",
			usepager: true,
			singleSelect: true,
			useRp: true,
			rp: 15,
			qtype: "movements.date",
			query: (search?"ß":""),
			width: 'auto',
			height: 'auto',
			onRowSelected:movements_row_selected,
			onRowSelectedClick:movements_row_selected_click
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



function movements_row_selected(itemId,row,grid)
{
	flexiItemId=itemId;
	$('.edit').show();
	$('.details').show();
	$('.delete').show();
}

function movements_row_selected_click(itemId,row,grid)
{
	movementsEdit();
}

function menu_movements_new_click()
{
	listMovementsButton_Click(false);
	movementsAdd();
}


function movementsDetails()
{
	showWait();
	$.post('include/movements.php', { op: "details", id:  flexiItemId},
		function(data)
		{
			var id=flexiItemId.substr(3);
			data=getData(data);
			var header=data.header[id];
			var details=data.details;


			$('#div_main').html($('<div>').addClass('detail_div'));

			$('<input>').prop("type","button")
					.prop("class","cancel")
					.val("close")
					.click(function()
					{
						showDiv("div_flexi");
					}).appendTo($(".detail_div"));

			$('<table>').append(
				$('<tr>').append($('<td>').text('movement details').attr('colspan',2)).addClass('header'),
				$('<tr>').append(
					$('<td>').text("date"),$('<td>').text(header.date)),
				$('<tr>').append(
					$('<td>').text("from"),$('<td>').text(header.place_from)),
				$('<tr>').append(
					$('<td>').text("to"),$('<td>').text(header.place_to)),
				$('<tr>').append(
					$('<td>').text("note"),$('<td>').text(header.note))
			).appendTo($(".detail_div")).addClass("header_table");

			$(".detail_div").append(buildMovementDetailTable(details));
			showDiv("div_main");
		});
}


function buildMovementDetailTable(details)
{
	var table=$('<table>').append(
	$('<tr>').append($('<td>').text('items moved').attr('colspan',12)).addClass('header'),
	$('<tr>').append(
		$('<td>').text("pn"),
		$('<td>').text("licence number"),
		$('<td>').text("licence name"),
		$('<td>').text("licence prog"),
		$('<td>').text("licence type"),
		$('<td>').text("description"),
		$('<td>').text("owner"),
		$('<td>').text("sn"),
		$('<td>').text("qty"),
		$('<td>').text("location"),
		$('<td>').text("position"),
		$('<td>').text("bsd")
		).addClass('header')
	).attr('id','detail_table');
	$.each(details, function(i, detail)
	{
		$('<tr>').append(
			$('<td>').text(detail.pn),
			$('<td>').text(detail.licence_number),
			$('<td>').text(detail.licence_name),
			$('<td>').text(detail.licence_prog),
			$('<td>').text(detail.licence_type),
			$('<td>').text(detail.description),
			$('<td>').text(detail.owner),
			$('<td>').text(detail.sn),
			$('<td>').text(detail.qty),
			$('<td>').text(detail.location),
			$('<td>').text(detail.position),
			$('<td>').text(detail.bsd)
		).appendTo(table);

	});
	return table;
}

function movementsDelete()
{
}

function movementsAdd(flexiItemId)
{
	var id_items=(typeof(flexiItemId)!="undefined"?flexiItemId.substr(3):0);
	showWait();

	$.post('include/movements.php', { op: "add", id_items: id_items},
		function(data)
		{
			data=getData(data);
			var addon=data.addon;
			$('#div_main').html(data.form);
			$('#editform').attr("enctype","multipart/form-data");
			$('#editform').attr("action",'include/movements.php');
			$('#editform').attr("method",'post');
			$('#submit').bind('click', function(){$('#editform').submit()});
			$('#cancel').bind('click', movements_form_cancel);
			showDiv("div_main");
			$("#date").datetimepicker({ timeFormat: 'HH:mm:ss',dateFormat: "yy-mm-dd" });
			initMovement();
			initMovementDocuments();

			$("#editform").append($("<input>").attr("type","hidden").attr("name","op").val("do_add"));
			$("#editform").append("<table id='movement_details' class='form boxed'><tr><td>PN</td><td>SN</td></tr></table>");
			if(id_items>0)
			{
				$('#id_places_from').val(data.addon["id_places"]);
				avoidPlacesCollision($('#id_places_from'));
				doFillPnFromSn(1,addon["id_parts"],addon["description"],addon["pn"],id_items);
			}
			else
			{
				$("#movement_details").hide();
				$("#movement_documents").hide();
			}



			$('#editform').ajaxForm(
			{
				beforeSubmit:
				function(formData, jqForm, options)
				{
					return movements_form_submit();
				},
				success:function(data)
				{
					switch(data)
					{
						case "1":
							notify(1,"no items to move");
							break;
						case "0":
							$(".flexme").flexReload();
							resetButtons();
							if(id_items>0)
							{
								$("#jd_menu li").removeClass("active");
								$("#jd_items").addClass("active");
							}
							showDiv("div_flexi");
							notify(0,"movement added");
							break;
						default:
							notify(1,"something went wrong, check error log");
							break;
					}
				}
			});
		});
}

function initMovementDocuments()
{
	$('<table>').append
	(
		$('<tr>').append
		(
				$('<td>').attr("colspan",3).text('upload documents')
		),
		$('<tr>').append
		(
			$('<td>'),
			$('<td>').text("file"),
			$('<td>').text('description')
		),
		$('<tr>').append
		(
			$('<td>').append($('<input>').attr("type","button").attr("class","cancel").attr("name","docdel_0").val('del').click(function()
					{
						delDoc(this);
					})),
			$('<td>').append($('<input>').attr("type","file").attr("class","cancel").attr("name","docfile_0")),
			$('<td>').append($('<input>').attr("type","text").attr("name","docdesc_0"))
		),
		$('<tr>').append
		(
			$('<td>').attr("colspan",3).append($('<input>').attr("type","button").attr("class","cancel").attr("name","docadd").val('add').click(function()
					{
						addDoc(this);
					}))
		)
	).attr("id","movement_documents").addClass("form boxed").appendTo($("#editform"));
}

function delDoc(sender)
{
	if($("#movement_documents tr").length>4)
		$(sender).closest('tr').remove();
}

function addDoc(sender)
{
	var prev_row=$(sender).closest('tr').prev();
	var prev_del_button=prev_row.find("input[name^='docdel_']");
	var prev_id=prev_del_button.attr("name").split("_")[1];
	prev_row.find("input").removeClass("error");
	var docinput=$("input[name='docfile_"+prev_id+"']");
	var descinput=$("input[name='docdesc_"+prev_id+"']");
	if((docinput.val().length)&&(descinput.val().length))
	{
		var new_row=prev_row.clone(true);
		$(new_row).find("input").each(function()
		{
			var splitted=this.name.split("_");
			this.name=splitted[0]+"_"+String(Number(prev_id)+1);
			if(splitted[0]!="docdel")
				this.value="";
		});
		prev_row.after(new_row);
	}
	else
	{
		if(docinput.val().length==0)
			docinput.addClass("error");
		if(descinput.val().length==0)
			descinput.addClass("error");
	}
}

function initMovement()
{
	$('#date').datetimepicker('setDate', (new Date()));
	$('#id_places_from').change(function()
		{
			avoidPlacesCollision($(this));
		});
	$('#id_places_to').change(function()
		{
			avoidPlacesCollision($(this));
		});
}

function avoidPlacesCollision(sender)
{
	var id=sender.attr("id");
	var other_id=(id=="id_places_from"?"id_places_to":"id_places_from");
	if(($("#"+id).val()!=0)&&($("#"+id).val()==$("#"+other_id).val()))
		$("#"+other_id).val(0);

	if((id=="id_places_from")||($("#id_places_from").val()==0))
	{
		deleteRows(0);
		if(($("#id_places_from").val()!=0))
		{
			addMovementsRow();
			$("#movement_documents").show();
			$("#movement_details").show();
		}
		else
		{
			$("#movement_documents").show();
			$("#movement_details").hide();
		}
	}
	if(id=="id_places_to")
		updateBsd(sender.val());
}

function updateBsd(value)
{
	var value_splitted=value.split("_");
	var bsd_select="<select name='bsd{ni}_{id_parts}_{index}'><option value='0'>---</option></select>";

	if(value_splitted.length==2)
	{
		var id_places=value;
		var id_places_types=value_splitted[1];
		if(id_places_types!='0')
			$('select[name^="bsd"]').remove();
		else
		{
			var id_items=$("input[name^='chk']");
			for(var i=0;i<id_items.length;i++)
			{
				var splitted=id_items[i].name.split("_");
				var ni=splitted[0].substr(3);
				var id_parts=splitted[1];
				var index=splitted[2];
				var act_bsd_select=bsd_select.replace(/{id_parts}/g,id_parts).replace(/{index}/g,index).replace(/{ni}/g,ni);
				var bsd_cell=$(id_items[i]).parent().parent().find("td:last");
				bsd_cell.html(act_bsd_select);
			}

			var id_parts=$("input[id^='id_parts_']");
			id_parts_list="";
			for(var i=0;i<id_parts.length;i++)
				if(id_parts[i].value>0)
					id_parts_list+=String(id_parts[i].value)+",";
			if(id_parts_list.length)
				id_parts_list=id_parts_list.substr(0,id_parts_list.length-1);


			 $.ajax({
					url: "include/movements.php",
					data: { op: "build_bsd_combos", id_places_to: id_places,id_parts_list:id_parts_list},
					type: "post",
					async: false,
					success: function(data)
					{
						var bsd_list=getData(data);
						$.each(bsd_list,function(id_parts,bsdCombo)
						{
							initializeBsdCombos(id_parts,bsdCombo);
						});
					}
				});

		}
	}
	else
		$('select[name^="bsd"]').remove();

}

function fixBsdToBeShown(row)
{
	var chk=row.find("input[name^='chk']");
	var sn=row.find("input[name^='sn']");
	var bsd=row.find("select[name^='bsd']");

	if(chk.is(':checked')&&($.trim(sn.val()).length))
		bsd.show();
	else
	{
		bsd.val(0);
		bsd.hide();
	}
}

function pnTd(i)
{
	var t="<input type='text' id='pn_{i}' name='pn_{i}'>"+
			"<input type='hidden' id='id_parts_{i}' name='id_parts_{i}' value='0'>"+
			"<p class='description' id='description_{i}'></p>";
	return t.replace(/{i}/g,i);
}

function snTd(i)
{
	var t="<input type='text' id='sn_{i}' name='sn_{i}'>";
	return t.replace(/{i}/g,i);
}

function addMovementsRow()
{
	var i=$("#movement_details > tbody > tr").length;
	var rowText="<tr>"+
					"<td>"+
						pnTd(i)+
					"</td>"+
					"<td>"+
						snTd(i)
						+
					"</td>"+
				"</tr>";

	$("#movement_details").append(rowText);
	setPnAutocomplete(i);
	setSnAutocomplete(i);
}

function getExcludeString()
{
	var excludeString=new Array();
	$('input[id^="id_parts_"]').each(function()
		{
			if($(this).val().length)
				excludeString.push($(this).val());
		});
	return excludeString.toString();
}

function setPnAutocomplete(i)
{
	var excludeString=getExcludeString();
	var mustMatch=($("#id_places_from").val().split("_")[1]>1?0:1);
	$('#pn_'+i).autocomplete("include/itemsAutocompleteBackend.php",
		{
			minChars:0,
			matchSubset:1,
			matchContains:1,
			cacheLength:10,
			formatItem:function(row)
			{
				var pn,ln;
				if(Number(row[5]))
				{
					pn=row[4];
					ln=row[0];
				}
				else
				{
					pn=row[0];
					ln=row[4];
				}

				if(Number(row[3]))
					return "<b>"+pn+"</b> - <b>"+ln+"</b>"
						+ "<br>"+row[1];
				else
					return pn+"<b> - </b>"+ln+"<br><i>"+row[1]+"</i>";

			},
			onItemSelect:itemSelected,
			extraParams:
			{
				from:$('#id_places_from').val().split("_")[0],
				exclude:excludeString,
				mustMatch:mustMatch
			},
			rowNumber:i,
			selectOnly:1,
			mustMatch:mustMatch
		});
}
function setSnAutocomplete(i)
{
	var excludeString=getExcludeString();
	$('#sn_'+i).autocomplete("include/itemsAutocompleteBackend.php",
		{
			minChars:0,
			matchSubset:1,
			matchContains:1,
			cacheLength:10,
			formatItem:function(row) {
				return "<b>" + row[0] + "</b>"
				+ "<br><i>" + row[1] + "</i>";
			},
			onItemSelect:fillPnFromSn,
			extraParams:
			{
				from:$('#id_places_from').val().split("_")[0]
				,sn: 1
				,exclude:excludeString
			},
			rowNumber:i,
			selectOnly:1,
			mustMatch:1
		});
}

function itemSelected(li)
{
	var n=li.rowNumber;
	deleteRows(n);

	var desc=$("#description_"+n);
	if(li.extra.length)
	{
		desc.html(li.extra[0]);
		desc.show();
		var id_parts=li.extra[1];
		fillSnFromPn(n,id_parts);
	}
	else
	{
		desc.hide();
		var row=$("#movement_details > tbody > tr")[n];
		var td=$(row).find("td")[1];
		$(td).html(snTd(n));
		setSnAutocomplete(n);

		var pn=$("#pn_"+n).val();
		if(pn.length)
		{
			showNewPartForm(pn,n);
		}
	}
}

function showNewPartForm(pn,n)
{
	var id_places_from=$("#id_places_from").val();
	var id_places_from_splitted=id_places_from.split("_");
	id_places_from=id_places_from_splitted[0];
	id_places_type=id_places_from_splitted[1];

	showModal();
	var form='<form name="newPartForm" id="newPartForm"></form>';
	$("#dialog").append(form);
	$("#newPartForm").append('<table id="newPartTable"></table>');
	$("#newPartTable").append('<tr><td colspan="2" class="form_header">Create new Part</td></tr>');
	$("#newPartTable").append('<tr><td>supplier</td><td><select name="id_suppliers" id="id_suppliers"></select></td></tr>');
	$("#newPartTable").append('<tr><td>manufacturer</td><td><select name="id_manufacturers" id="id_manufacturers"></select></td></tr>');
	$("#newPartTable").append('<tr><td>description</td><td><input name="description" id="description"></td></tr>');
	$("#newPartTable").append('<tr><td>part number</td><td><input name="pn" id="pn"></td></tr>');
	$("#newPartTable").append('<tr><td>measure unit</td><td><select name="id_measure_unit" id="id_measure_unit"></select></td></tr>');
	$("#newPartTable").append('<tr><td>category</td><td><select name="id_category" id="id_category"></select></td></tr>');
	$("#newPartTable").append('<tr><td>cage code</td><td><input name="cage_code" id="cage_code"></td></tr>');
	$("#newPartTable").append('<tr><td>shelf life</td><td><input name="shelf_life" id="shelf_life"></td></tr>');
	$("#newPartTable").append('<tr><td>criticality</td><td><input name="criticality" id="criticality"></td></tr>');
	$("#newPartTable").append('<tr><td>minimum quantity</td><td><input name="minimum_quantity" id="minimum_quantity"></td></tr>');
	$("#newPartTable").append('<tr><td>ata cap</td><td><input name="ata_cap" id="ata_cap"></td></tr>');
	$("#newPartTable").append('<tr><td>job card number</td><td><input name="job_card_number" id="job_card_number"></td></tr>');
	$("#newPartTable").append('<tr><td>zones</td><td><input name="zones" id="zones"></td></tr>');
	$("#newPartTable").append('<tr><td colspan="2" class="form_footer"></td></tr>');
	$(".form_footer").append('<input type="button" name="submit" id="npsubmit" value="submit">');
	$(".form_footer").append('<input type="button" name="cancel" id="npcancel" value="cancel">');

	$("#npsubmit").click(function()
		{
			var notnull=new Array("description","pn");
			var magzero=new Array("id_suppliers","id_measure_unit","id_category");

			var ok=form_validate(notnull,magzero,"newPartForm");
			if(ok)
			{
				var id_parts=form_post("parts","newPartForm");
				if(id_parts>0)
				{
					var description=$("#description").val();
					hideModal();
					showDiv("div_main");
					$("#id_parts_"+n).val(id_parts);
					$("#description_"+n).html(description);
					$("#description_"+n).show();
					var ac = $("#pn_"+n)[0].autocompleter;
					ac.flushCache();
					ac.setSelected(pn,false);
					fillSnFromPn(n,id_parts);
				}
				else
				{
					$("#pn_"+n).val("");
				}
			}
		});

	$("#npcancel").click(function()
		{
			$("#pn_"+n).val("");
			hideModal();
			$("#pn_"+n).focus();
		});

	$.post('include/movements.php', { op: "newPart"},
		function(data)
		{
			data=getData(data);
			var categories=data.categories;
			var suppliers=data.suppliers;
			var manufacturers=data.manufacturers;
			var measure_unit=data.measure_unit;

			$("#id_category").append('<option value="0">---</select>');
			$("#id_suppliers").append('<option value="0">---</select>');
			$("#id_manufacturers").append('<option value="0">---</select>');
			$("#id_measure_unit").append('<option value="0">---</select>');

			for(var key in categories)
				$("#id_category").append('<option value="'+key+'">'+categories[key]+'</select>');
			for(var key in suppliers)
				$("#id_suppliers").append('<option value="'+key+'">'+suppliers[key]+'</select>');
			for(var key in manufacturers)
				$("#id_manufacturers").append('<option value="'+key+'">'+manufacturers[key]+'</select>');
			for(var key in measure_unit)
				$("#id_measure_unit").append('<option value="'+key+'">'+measure_unit[key]+'</select>');

			$("#id_suppliers option[value='"+id_places_from+"']").attr('selected', 'selected');
			$("#id_manufacturers option[value='"+id_places_from+"']").attr('selected', 'selected');
		});


	$("#pn").val(pn);
}


function doFillPnFromSn(n,id_parts,description,pn,id_items)
{
	$("#id_parts_"+n).val(id_parts);
	$("#description_"+n).html(description);
	$("#description_"+n).show();
	var ac = $("#pn_"+n)[0].autocompleter;
	ac.setSelected(pn,false);
	fillSnFromPn(n,id_parts,id_items);
	addMovementsRow();
}

function fillPnFromSn(li)
{
	if(li.extra.length)
	{
		var n=li.rowNumber;
		var description=li.extra[0];
		var id_items=li.extra[1];
		var id_parts=li.extra[2];
		var pn=li.extra[3];

		doFillPnFromSn(n,id_parts,description,pn,id_items);
	}
}

function buildCombo(in_array)
{
	var out=$("<select>").append($("<option>").attr("value","0").text("---"));
	for(var i=0;i<in_array.length;i++)
		out.append($("<option>").attr("value",in_array[i].id).text(in_array[i].description));
	return out;
}

function fillSnFromPn(n,id_parts,id_items)
{
	var row=$("#movement_details > tbody > tr")[n];
	var td=$(row).find("td")[1];
	id_items=(typeof id_items!=='undefined'?id_items:0);

	var snHeader="<tr><td></td><td>from location</td><td>from position</td><td>licence name</td><td>licence number</td><td>licence prog</td><td>licence type</td><td>owner</td><td>sn</td><td>qty</td><td>to location</td><td>to position</td><td>BSD</td></tr>";
	var snRow="<tr>"+
			"<td><input type='checkbox' name='chk_"+id_parts+"_{id_items}' {checked}></td>"+
			"<td>{fromlocation}</td>"+
			"<td>{fromposition}</td>"+
			"<td>{licence_name}</td>"+
			"<td>{licence_number}</td>"+
			"<td>{licence_prog}</td>"+
			"<td>{licence_type}</td>"+
			"<td>{owner}</td>"+
			"<td>{sn}<input type='hidden' name='snni_"+id_parts+"_{id_items}' value='{sn}'></td>"+
			"<td><input type='text' {displayqty} name='qty_"+id_parts+"_{id_items}' value='{qty}'></td>"+
			"<td><input type='text' name='loc_"+id_parts+"_{id_items}'></td>"+
			"<td><input type='text' name='pos_"+id_parts+"_{id_items}'></td>"+
			"<td><select name='bsd_"+id_parts+"_{id_items}'><option value='0'>---</option></select></td>"+
			"</tr>";

	var niRow="<tr>"+
			"<td><input type='checkbox' name='chkni_"+id_parts+"_1'>new supply</td>"+
			"<td>{fromlocation}</td>"+
			"<td>{fromposition}</td>"+
			"<td>{licence_name}</td>"+
			"<td>{licence_number}</td>"+
			"<td>{licence_prog}</td>"+
			"<td>{licence_type}</td>"+
			"<td>{owner}</td>"+
			"<td><input type='text' name='snni_"+id_parts+"_1'></td>"+
			"<td><input type='text' name='qtyni_"+id_parts+"_1' value='1'></td>"+
			"<td><input type='text' name='locni_"+id_parts+"_1'</td>"+
			"<td><input type='text' name='posni_"+id_parts+"_1'</td>"+
			"<td><select name='bsdni_"+id_parts+"_1'><option value='0'>---</option></select></td>"+
			"</tr>";


	$('#id_parts_'+n).val(id_parts);
	$.ajax(
			{
				type: 'post',
				url: "include/movements.php",
				data: { op:	"fillSnFromPn",
						id_parts: id_parts,
						id_places_from: $('#id_places_from').val(),
						id_places_to: $('#id_places_to').val()
					},
				success: function(data)
					{
						var id_places_types=Number(($('#id_places_from').val().split("_")[1]));
						data=getData(data);
						var bsdCombo=data.bsdCombo;
						if(id_places_types>1)
						{
							var ownCombo=buildCombo(data.owners);
							ownCombo.attr("name","ownni_"+id_parts+"_1");
							var ltyCombo=buildCombo(data.licence_types);
							ltyCombo.attr("name","ltyni_"+id_parts+"_1");

							var licence_name_input="<input type='text' name='lnani_"+id_parts+"_1'>";
							var licence_number_input="<input type='text' name='lnuni_"+id_parts+"_1'>";
							var licence_prog_input="<input type='text' name='lprni_"+id_parts+"_1'>";
							var licence_types_combo=ltyCombo[0].outerHTML;
							var owners_combo=ownCombo[0].outerHTML;
						}
						data=data.rows;

						var showLocation=false;
						var Location=null;
						var showPosition=false;
						var Position=null;

						var showLicenceName=(id_places_types>1);
						var LicenceName=null;
						var showLicenceNumber=(id_places_types>1);
						var LicenceNumber=null;
						var showLicenceProg=(id_places_types>1);
						var LicenceProg=null;
						var showLicenceType=(id_places_types>1);
						var LicenceType=null;
						var showOwner=(id_places_types>1);
						var Owner=null;
						for(i=0;i<data.length;i++)
						{
							if(Location==null)
								Location=data[i].location;
							else
							{
								if(data[i].location!=Location)
									showLocation=true;
							}
							if(Position==null)
								Position=data[i].position;
							else
							{
								if(data[i].position!=Position)
									showPosition=true;
							}
							if(id_places_types==1)
							{
								if(LicenceName==null)
									LicenceName=data[i].licence_name;
								else
								{
									if(data[i].licence_name!=LicenceName)
										showLicenceName=true;
								}
								if(LicenceNumber==null)
									LicenceNumber=data[i].licence_number;
								else
								{
									if(data[i].licence_number!=LicenceNumber)
										showLicenceNumber=true;
								}
								if(LicenceProg==null)
									LicenceProg=data[i].licence_prog;
								else
								{
									if(data[i].licence_prog!=LicenceProg)
										showLicenceProg=true;
								}
								if(LicenceType==null)
									LicenceType=data[i].licence_type;
								else
								{
									if(data[i].licence_type!=LicenceType)
										showLicenceType=true;
								}
								if(Owner==null)
									Owner=data[i].owner;
								else
								{
									if(data[i].owner!=Owner)
										showOwner=true;
								}
							}
						}
						var realHeader=snHeader;
						var realniRow=niRow;
						var actRow=snRow;
						if(showLocation==false)
						{
							realniRow=realniRow.replace(/<td>{fromlocation}<\/td>/g,"");
							realHeader=realHeader.replace(/<td>from location<\/td>/g,"");
							actRow=actRow.replace(/<td>{fromlocation}<\/td>/g,"");
						}
						else
							realniRow=realniRow.replace(/{fromlocation}/g,"");

						if(showPosition==false)
						{
							realniRow=realniRow.replace(/<td>{fromposition}<\/td>/g,"");
							realHeader=realHeader.replace(/<td>from position<\/td>/g,"");
							actRow=actRow.replace(/<td>{fromposition}<\/td>/g,"");
						}
						else
							realniRow=realniRow.replace(/{fromlocation}/g,"");
						if(showLicenceName==false)
						{
							realniRow=realniRow.replace(/<td>{licence_name}<\/td>/g,"");
							realHeader=realHeader.replace(/<td>licence name<\/td>/g,"");
							actRow=actRow.replace(/<td>{licence_name}<\/td>/g,"");
						}
						else
							realniRow=realniRow.replace(/{licence_name}/g,licence_name_input);
						if(showLicenceNumber==false)
						{
							realniRow=realniRow.replace(/<td>{licence_number}<\/td>/g,"");
							realHeader=realHeader.replace(/<td>licence number<\/td>/g,"");
							actRow=actRow.replace(/<td>{licence_number}<\/td>/g,"");
						}
						else
							realniRow=realniRow.replace(/{licence_number}/g,licence_number_input);
						if(showLicenceProg==false)
						{
							realniRow=realniRow.replace(/<td>{licence_prog}<\/td>/g,"");
							realHeader=realHeader.replace(/<td>licence prog<\/td>/g,"");
							actRow=actRow.replace(/<td>{licence_prog}<\/td>/g,"");
						}
						else
							realniRow=realniRow.replace(/{licence_prog}/g,licence_prog_input);
						if(showLicenceType==false)
						{
							realniRow=realniRow.replace(/<td>{licence_type}<\/td>/g,"");
							realHeader=realHeader.replace(/<td>licence type<\/td>/g,"");
							actRow=actRow.replace(/<td>{licence_type}<\/td>/g,"");
						}
						else
							realniRow=realniRow.replace(/{licence_type}/g,licence_types_combo);
						if(showOwner==false)
						{
							realniRow=realniRow.replace(/<td>{owner}<\/td>/g,"");
							realHeader=realHeader.replace(/<td>owner<\/td>/g,"");
							actRow=actRow.replace(/<td>{owner}<\/td>/g,"");
						}
						else
							realniRow=realniRow.replace(/{owner}/g,owners_combo);


						$(td).html("<table></table>");
						var table=$(td).find("table");
						$(table).append(realHeader);


						for(i=0;i<data.length;i++)
						{
							var checked=(id_items==data[i].id?" checked='checked'":"");
							var displayqty=(data[i].sn.length>0);
							var displayqtystring="";
							if(displayqty)
							{
								var qty=1;
								displayqtystring="readonly='readonly'";
							}
							else
								var qty=data[i].qty;
							var realactRow=actRow.replace(/{id_items}/g,data[i].id);
							if(showLocation)
								realactRow=realactRow.replace(/{fromlocation}/g,data[i].location);
							if(showPosition)
								realactRow=realactRow.replace(/{fromposition}/g,data[i].position);
							if(showLicenceName)
								realactRow=realactRow.replace(/{licence_name}/g,data[i].licence_name);
							if(showLicenceNumber)
								realactRow=realactRow.replace(/{licence_number}/g,data[i].licence_number);
							if(showLicenceProg)
								realactRow=realactRow.replace(/{licence_prog}/g,data[i].licence_prog);
							if(showLicenceType)
								realactRow=realactRow.replace(/{licence_type}/g,data[i].licence_type);
							if(showOwner)
								realactRow=realactRow.replace(/{owner}/g,data[i].owner);
							realactRow=realactRow.replace(/{checked}/g,checked);
							realactRow=realactRow.replace(/{sn}/g,data[i].sn);
							realactRow=realactRow.replace(/{displayqty}/g,displayqtystring);
							realactRow=realactRow.replace(/{qty}/g,qty);
							$(table).append(realactRow);
						}

						if(id_places_types>1)
						{
							$(table).append(realniRow);
							$('[name^="snni_'+id_parts+'"]').change(function()
								{
									fixQtyRo(this);
									fixNiChk(id_parts);
								});
						}
						$(table).find(":checkbox").click(function()
							{
								checkboxClick(this,table,n);
							});
						initializeBsdCombos(id_parts,bsdCombo);
						updateAutocompleters();
						$('input[name^="qty"]').ForceNumericOnly();
						for(var i=0;i<$('input[name^="qty_"]').length;i++)
							$($('input[name^="qty"]')[i]).ForceLimit($('input[name^="qty"]')[i].value);

					},
				async:false
			});
}


function initializeBsdCombos(id_parts,bsdCombo)
{
	var showBsd=(($.type(bsdCombo)=="object")||($.type(bsdCombo)=="array"));

	if(showBsd)
	{
		selectOptions="";
		$.each(bsdCombo,function(k,v)
			{
				selectOptions+="<option value='"+k+"'>"+v+"</option>";
			});


		var bsdObjects=$("select[name^='bsd_"+id_parts+"'],select[name^='bsdni_"+id_parts+"']");
		bsdObjects.append(selectOptions);

		for(var i=0;i<bsdObjects.length;i++)
			fixBsdToBeShown($(bsdObjects[i]).closest("tr"));

		bsdObjects.change(function()
		{
			var sender=this;
			$.each($("select[name^='bsd_"+id_parts+"'],select[name^='bsdni_"+id_parts+"']"),function()
			{
				var chkInput=$('[name="chk'+this.name.substr(3)+'"]');
				if(!chkInput.is(':checked'))
					this.value=0;
				if((this.name!=sender.name)&&(this.value==sender.value))
					this.value=0;

			});
		});
	}
	else
		$("select[name^='bsd_"+id_parts+"'],select[name^='bsdni_"+id_parts+"']").remove();
}

function fixQtyRo(sender)
{
	var sender_splitted=sender.name.split("_");
	var value=$.trim(sender.value);


	if(value.length>0)
	{
		var sns=$('input[name^="snni_'+sender_splitted[1]+'"]');
		for(var i=0;i<sns.length;i++)
		{
			if(sns[i].name!=sender.name)
				if(sns[i].value==sender.value)
					sender.value="";
		}
	}


	var qtyInput=$('input[name="qtyni_'+sender_splitted[1]+'_'+sender_splitted[2]+'"]');
	var bsdSelect=$('select[name="bsd'+sender.name.substr(2)+'"]');
	if(value.length>0)
	{
		qtyInput.val("1");
		qtyInput.attr('readonly', true);
	}
	else
	{
		qtyInput.attr('readonly', false);
		bsdSelect.val(0);
	}
	fixBsdToBeShown($(sender).closest("tr"));
}

function checkboxClick(sender,table,n)
{
	var count=0;
	$(table).find(":checkbox").each(function(key,value)
	{
		if(this.checked)
		{
			count++;
			return;
		}
	});
	if(count==0)
		deleteRows(n);
	else
	{
		if($("#movement_details>tbody>tr").length==n+1)
			addMovementsRow();
	}

	fixBsdToBeShown($(sender).closest("tr"));
	var sender_splitted=sender.name.split("_");

	if(sender_splitted[0]=="chkni")
	{
		var m=sender_splitted[2];
		var mm=String(Number(m)+1);
		if(sender.checked)
		{
			var snok=fixNiChk(sender_splitted[1]);
			var nextChk=sender_splitted[0]+"_"+sender_splitted[1]+"_"+mm;
			var nextInput="snni_"+sender_splitted[1]+"_"+mm;
			var chk=$('td input[type=checkbox][name="'+nextChk+'"]',$(table));

			if((chk.length==0)&&(snok==true))
			{
				$("tr:last",$(table)).clone(true,true).find("input,select").each(function()
					{

						$(this).val('').attr('name', function()
							{
								if(this.type=="checkbox")
									$(this).removeAttr('checked');
								if(this.name.substr(0,3)=="bsd")
									$(this).hide();
								var exp=this.name.split("_");
								exp[exp.length-1]=String(Number(exp[exp.length-1])+1);
								return exp.join("_")
							});
					}
				).end().appendTo($(table));
			}
		}
	}
}

function fixNiChk(n)
{
	var chk=$('td input[type=checkbox][name^="chkni_'+String(n)+'"]',$("#movement_details"));
	var nosn=0;
	for(i=0;i<chk.length;i++)
	{
		var chksplitted=chk[i].name.split("_");;

		var sninutname="snni_"+chksplitted[1]+"_"+chksplitted[2];
		var sninput=$('td input[type=text][name="'+sninutname+'"]',$("#movement_details"));
		if(sninput.length)
		{
			if(($.trim(sninput[0].value)=="")&&(chk[i].checked))
				nosn++;
			if(nosn>1)
			{
				$(chk[i]).attr('checked', false);
			}
		}
	}
	return(nosn<2);
}

function deleteRows(n)
{
	var rows=$("#movement_details > tbody > tr");
	for(i=n+1;i<rows.length;i++)
	{
		$(rows[i]).remove();
	}
}

function movementsEdit()
{
	showWait();
	$.post('include/movements.php', { op: "edit", id:  flexiItemId},
		function(data)
		{
			data=getData(data);
			var details=data.details;
			var documents=data.documents;
			$('#div_main').html(data.form).append($('<div>').addClass('detail_div'));
			$('#editform').attr("enctype","multipart/form-data");
			$('#editform').attr("action",'include/movements.php');
			$('#editform').attr("method",'post');7
			$('#editform').append($("<input>").attr("type","hidden").attr("name","op").val("do_edit"));
			initMovementDocuments();
			$('#submit').bind('click', function(){$('#editform').submit()});


			$(".detail_div").append(buildMovementDetailTable(details));

			$('<table>').append(
				$('<tr>').append($('<td>').text('related documents').attr('colspan',3)).addClass('header'),
				$('<tr>').append(
						$('<td>').text(""),
						$('<td>').text("filename"),
						$('<td>').text("description")
					).addClass('header')
				).addClass('form boxed').appendTo($("#editform")).attr('id','documents_table');

			$.each(documents, function(i, document)
			{
				$('<tr>').append(
					$('<td>').append(
							$("<input>").attr("type","button").attr("name","docdel").val("del").on("click",delDocument),
							$("<input>").attr("type","hidden").attr("name","id_documents[]").val(document.id_documents)
						),
					$('<td>').text(document.filename),
					$('<td>').text(document.description)
				).appendTo($("#documents_table"));
            });


			$('#editform').ajaxForm(
			{
				beforeSubmit:
				function(formData, jqForm, options)
				{
					return movements_edit_submit();
				},
				success:function(data)
				{
					data=getData(data);
					if(data.length==0)
						return;
					$(".flexme").flexReload();
					resetButtons();
					showDiv("div_flexi");
					notify(data.out,data.message);
				}
			});
			$('#cancel').bind('click', movements_form_cancel);
			showDiv("div_main");
			$("#date").datetimepicker({ timeFormat: 'HH:mm:ss',dateFormat: "yy-mm-dd" });
		});
}
function delDocument(sender)
{
	$(this).closest("tr").remove();
}
function movements_edit_submit()
{
	var notnull=new Array();
	var magzero=new Array();

	var ok=form_validate(notnull,magzero);
	ok=ok && validate_movements_documents();

	return ok;
}


function movements_form_submit()
{
	var notnull=new Array();
	var magzero=new Array("id_places_from","id_places_to");

	var ok=form_validate(notnull,magzero);
	ok=ok && validate_movements_details();
	ok=ok && validate_movements_documents();
	ok=ok && validate_movements_sn();
	return ok;
}

function validate_movements_sn()
{
	var out=true;
	var op="check_sn";
	var chkni=$("input:checked[name^='chkni_']");
	var postdata = {};
	var dopost=false;

	for(var i=0;i<chkni.length;i++)
	{
		var ni=$("input[name='snni_"+chkni[i].name.substr(6)+"']");
		ni.val($.trim(ni.val()));
		if(ni.val().length)
		{
			dopost=true;
			postdata[ni.attr("name")]=ni.val();
		}
	}
	if(dopost)
	{
		out=false;
		postdata["op"]="check_sn";
		$.ajax({
					url: "include/movements.php",
					data: postdata,
					type: "post",
					async: false,
					success: function(data)
					{
						if(data.length)
						{
							$("input[type='text'][name^='snni_']").removeClass("error");
							var splitted=data.split(",");
							for(var i=0;i<data.length;i++)
								$("input[name='"+splitted[i]+"']").addClass("error");
						}
						else
							out=true;
					}
				});
	}
	return out;
}



function movements_form_cancel()
{
	showDiv("div_flexi");
	if($('.hDivBox:contains("BSD")').length)
	{
		$("#jd_menu li").removeClass("active");
		$("#jd_items").addClass("active");
	}
}

function updateAutocompleters()
{
	var excludeString=new Array();
	$('input[id^="id_parts_"]').each(function()
		{
			if($(this).val().length)
				excludeString.push($(this).val());
		});
	$('input[id^="pn_"]').each(function()
		{
			var i=$(this)[0].id.split("pn_")[1];
			var id_parts=$('#id_parts_'+i).val();
			var thisExclude=excludeString.slice();
			var index;
			if($(this)[0].autocompleter!=undefined)
			{
				if($(this).val().length)
					if((index=thisExclude.indexOf(id_parts))!=-1)
						thisExclude.splice(index, 1);
				var excluded=thisExclude.toString();
				$(this)[0].autocompleter.flushCache();
				$(this)[0].autocompleter.setExtraParams({exclude:excluded});
			}
		});

	$('input[id^="sn_"]').each(function()
		{
			if($(this)[0].autocompleter!=undefined)
			{
				$(this)[0].autocompleter.flushCache();
				$(this)[0].autocompleter.setExtraParams({exclude:excludeString});
			}
		});
}

function validate_movements_documents()
{
	var files=$("#movement_documents input[name^='docfile_']");
	ok=true;
	for(i=0;i<files.length;i++)
	{
		var n=files[i].name.split("_")[1];
		var desc=$("#movement_documents input[name='docdesc_"+n+"']")[0];
		$(desc).removeClass("error");

		if((files[i].value!="")&&(desc.value==""))
		{
			$(desc).addClass("error");
			ok=false;
		}
	}
	return ok;
}

function validate_movements_details()
{
	var checkboxes=$('#movement_details input[name^="chk"]');
	var ok=false;
	checkboxes.each(function()
		{
			var splitted=this.name.split("_");
			var id_parts=splitted[1];
			var bsd_select_name="bsd"+splitted[0].substr(3)+"_"+id_parts+"_"+splitted[2];
			var bsd_select=$('select[name="'+bsd_select_name+'"]');
			if(this.checked)
			{
				if((bsd_select.length==1)&&(bsd_select[0].value==0))
					bsd_select.addClass("error");
				else
				{
					bsd_select.removeClass("error");
					ok=true;
				}
			}
			else
				bsd_select.removeClass("error");

		});
	if(ok==false)
		notify(1,"no items to move");
	return ok;
}

function showDoc(id_documents)
{
	window.open("include/movements.php?op=showDoc&id_documents="+id_documents);
}
