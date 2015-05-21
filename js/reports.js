function menu_reports_inventory_click()
{
	var id_fleet=getSessionValue("id_fleet");


	var campi={ Description : 'parts.description'
			, pn: 'parts.pn'
			, Licence_Type : 'licence_types.description'
			, Licence_Number: 'items_grouped.licence_number'
			, Qty: "COUNT(DISTINCT items_grouped.id)"
			, Serial_Number: 'items_grouped.sn'
			, Property: 'owners.description'
			, Fleet: 'fleet.description'
			, Place: 'places.name'
			, Location: 'items_grouped.location'
			, Position: 'items_grouped.position'
		};

	var options=$('<select></select>');
	var i=0;
	$.each(campi, function(key, value)
	{
		i++;
		options.append('<option value="'+i+'">'+i+'</option>');
	});
	

	var table=$('<table></table>').attr('id','reportBuilder');
	table
			.append($('<tr></tr>').addClass('header')
				.append($('<td></td>').text('Field'),
						$('<td></td>').text('Visible'),
						$('<td></td>').text('Sort'),
						$('<td></td>').text('Desc'),
						$('<td></td>').text('AND'),
						$('<td></td>').text('OR')
					)
				);

	i=0;
	$.each(campi, function(key, value) 
	{
		value=value.replace('(','POpen').replace(')','PClose').replace(' ','PSpace').replace('.','PPoint');
		i++;
		table
			.append($('<tr></tr>')
				.append($('<td></td>').text(key.replace("_"," ")),
						$('<td></td>').append($('<input>').attr('name','chk_'+value).attr('type','checkbox').attr('checked','checked').click(rbCheckboxChange)),
						$('<td></td>').append(options.clone().attr('name','sel_'+value).val(i).change(rbSelectChange)),
						$('<td></td>').append($('<input>').attr('name','desc_'+value).attr('type','checkbox')),
						$('<td></td>').append($('<input>').attr('name','and_'+value).attr('type','text')),
						$('<td></td>').append($('<input>').attr('name','or_'+value).attr('type','text'))
					)
				)
		
		
	});
	table.append($('<tr></tr>').append($('<td></td>').attr('colspan','3').
		append($('<input>').attr('type','button').val('submit').click(inventoryReportSubmit)
			,$('<a></a>').attr('href','#').attr('id','selectAllButton').text('export to csv').click(function(){
					 exportTableToCSV.apply(this, [$('#inventoryReportContent'), 'export.csv']);
					 })
			)
		));
	$('#div_main').html('').append(table).append($('<div></div>').attr('id','inventoryReportContent'));;	
	$('#selectAllButton').addClass('button').hide();

	showDiv("div_main");
}

function inventoryReportSubmit(e)
{
	var params;
	params=$("#reportBuilder select[name^='sel_'],input[name^='desc_'],input[name^='and_'],input[name^='or_']").serializeArray();
	params.push({name: 'op',value :'inventoryReportPost'});
	$('#selectAllButton').hide();
	$('#inventoryReportContent').text('...processing...');

	 $.ajax({
			url: "include/reports.php",
			data: params,
			type: "post",
			async: true,
			success: function(data) 
			{
				data=getData(data);
				if(data.length>0)
				{
					var titles=[];
					var select=$("#reportBuilder select[name^='sel_']");
					for(var i=0;i<select.length;i++)
					{
						var titleCell=$(select[i]).parent().prev().prev();
						titles[Number(select[i].value)-1]=titleCell.html();
					}
					$('#inventoryReportContent').text('');
					$('#inventoryReportContent').append(buildReport(titles,data));
					$('#selectAllButton').show();
				}
			}
		});

}
function buildReport(header,rows)
{
	var table=$('<table></table');
	var headerRow=$('<tr></tr>').addClass('header');
	for(var i=0;i<header.length;i++)
		headerRow.append($('<td></td>').text(header[i]));
	table.append(headerRow);
	for(var i=0;i<rows.length;i++)
	{
		var currentRow=$('<tr></tr>');
		$.each(rows[i], function(key, value)
		{
			currentRow.append($('<td></td>').text((value?value:"")));
		});
		table.append(currentRow);

	}
	return(table);
}
function rbCheckboxChange()
{
	var nchk=$("#reportBuilder input:checked[name^='chk_']").length;

	var selectName='sel_'+this.name.substr(4);
	var selectObject=$("#reportBuilder select[name='"+selectName+"']");
	var oldValue=nchk;
	if(selectObject.length==1)
		oldValue=Number(selectObject.val());

	var options=$('<select></select>');
	for(var c=1;c<=nchk;c++)
		options.append('<option value="'+c+'">'+c+'</option>');

	var ascboxName='desc_'+this.name.substr(4);
	var andboxName='and_'+this.name.substr(4);
	var orboxName='or_'+this.name.substr(4);
	if(!this.checked)
	{
		$("#reportBuilder input[name='"+ascboxName+"']").remove();
		$("#reportBuilder input[name='"+andboxName+"']").remove();
		$("#reportBuilder input[name='"+orboxName+"']").remove();
	}
	else
	{
		$(this).parent().next().next().html("").append($('<input>').attr('name',ascboxName).attr('type','checkbox'));
		$(this).parent().next().next().next().html("").append($('<input>').attr('name',andboxName).attr('type','text'));
		$(this).parent().next().next().next().next().html("").append($('<input>').attr('name',orboxName).attr('type','text'));
	}


	$("#reportBuilder input[name^='chk_']").each(function()
	{
		var name=this.name;
		var selectValue;
		var selectName='sel_'+name.substr(4);
		var selectObject=$("#reportBuilder select[name='"+selectName+"']");
		if(selectObject.length==1)
		{
			selectValue=(Number(selectObject.val())<oldValue?selectObject.val():selectObject.val()-1);
			selectObject.remove();
		}
		else
			selectValue=nchk;

		if(this.checked)
			$(this).parent().next().html("").append(options.clone().attr('name',selectName).val(selectValue).change(rbSelectChange));
		/*
		='sel_'+name.substr(4);
.append(options.clone().attr('name','sel_'+value).val(i).change(rbSelectChange))^*/
	});

}

function rbSelectChange()
{
	var sender=this;
	var nsel=$("#reportBuilder select[name^='sel_']").length;
	var indexes=[];
	for(var i=1;i<=nsel;i++)
		if(Number(this.value)!=i)
			indexes.push(i);
	var collision=0;

	$("#reportBuilder select[name^='sel_']").each(function()
	{
		if(this.name!=sender.name)
		{
			if(this.value==sender.value)
			{
				collision=this;
			}
			else
			{
				var ind=$.inArray(Number(this.value),indexes);
				if(ind!=-1)
					indexes.splice(ind, 1);
			}
		}
	});
	if((collision)&&(indexes.length==1))
		$(collision).val(indexes.pop());
}


function menu_reports_UAVpartslife_click()
{
	showWait("div_QtbUavSelect");

	if(buildQtbMenu())
	{

		$("#div_QtbUavSelect span").click(function()
			{
				var id_uav=this.id.split("_")[1];
				if(id_uav=="incomplete")
					return;
				$("#UAV_incomplete").hide();

				$("#div_QtbUavSelect span").removeClass("active");
				$(this).addClass("active");
				reportConfiguration(id_uav);
			});

		if($("#div_QtbUavSelect span").length>0)
			$($("#div_QtbUavSelect span")[0]).trigger("click");
		showDiv("div_flexi,div_QtbUavSelect");
	}
	else
		showDiv("div_main");
}


function reportConfiguration(id_uav)
{
	flexiItemId = false;
	$("#form_container").hide();
	$("#flexi_container").show();
	$("#loading_container").hide();

	$(".flexigrid").remove();
	$("#div_flexi").append("<table class='flexme'></table>");
	$(".flexme").flexigrid
	(
		{
			url: 'include/reports.php',
			params: [{name:'op',value:'UAVpartslife'},{name:'uav_id',value:id_uav}],
			dataType: 'json',
			showToggleBtn: false,
			colModel : 
			[
				{
					display: 'P/N', 
					name : 'pn', 
					width : 80, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Description', 
					name : 'description', 
					width : 200, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'S/N', 
					name : 'items.sn', 
					width : 80, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Flight hours', 
					name : 'stick', 
					width : 70, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Engine hours', 
					name : 'hobbs', 
					width : 70, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Landings', 
					name : 'cycles', 
					width : 70, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Months', 
					name : 'months', 
					width : 70, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'FH limit', 
					name : 'repl_flight_hours', 
					width : 70, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'EH limit', 
					name : 'repl_engine_hours', 
					width : 70, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Landings limit', 
					name : 'repl_cycles', 
					width : 70, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Months limit', 
					name : 'repl_months', 
					width : 70, 
					sortable : true, 
					align: 'left'
				}
				
			],
			buttons : 
			[
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
					display: 'S/N', 
					name : 'items.sn'
				}
			],
			onSuccess: function()
			{
				$(".bDiv").height("auto");
			},
			sortname: "bsd.ordine",
			sortorder: "asc",
			usepager: true,
			singleSelect: true,
			useRp: true,
			rp: 15,
			qtype: "parts.pn",
//			query: (search?"ß":""),
			width: 'auto'
//			onRowSelected:qtb_row_selected,
//			onRowSelectedClick:qtb_row_selected_click
		}
	);
	showDiv("div_flexi,div_QtbUavSelect");
	resetButtons();
}


function menu_reports_warehouselife_click()
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
			url: 'include/reports.php',
			params: [{name:'op',value:'UAVpartslife'}],
			dataType: 'json',
			showToggleBtn: false,
			colModel : 
			[
				{
					display: 'P/N', 
					name : 'pn', 
					width : 80, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Description', 
					name : 'description', 
					width : 200, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'S/N', 
					name : 'sn', 
					width : 80, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Warehouse', 
					name : 'places.description', 
					width : 70, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Date',
					name : 'date', 
					width : 70, 
					sortable : true, 
					align: 'left'
				}
				
			],
			buttons : 
			[
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
					display: 'S/N', 
					name : 'items.sn'
				},				
				{
					display: 'Warehouse', 
					name : 'places.description'
				}
			],
			onSuccess: function()
			{
				$(".bDiv").height("auto");
			},
			sortname: "place",
			sortorder: "asc",
			usepager: true,
			singleSelect: true,
			useRp: true,
			rp: 15,
			qtype: "parts.pn",
//			query: (search?"ß":""),
			width: 'auto'
//			onRowSelected:qtb_row_selected,
//			onRowSelectedClick:qtb_row_selected_click
		}
	);
	showDiv("div_flexi");
	resetButtons();
}

function menu_reports_bsd_click()
{
	if(buildQtbMenu())
	{
		if($('#div_QtbUavSelect a').length==0)
			$('<a></a>').attr('href','#').addClass('button').text('export to csv').click(function(){
				exportTableToCSV.apply(this, [$('#BSDReportContent'), 'export.csv']);
				}).appendTo($("#div_QtbUavSelect"));

		$("#div_QtbUavSelect span").click(function()
			{
				var id_uav=this.id.split("_")[1];
				$("#UAV_incomplete").hide();
				$("#div_QtbUavSelect span").removeClass("active");
				$("#div_main").append($('<div></div').attr('id','BSDReportContent'));
				$(this).addClass("active");
				reportBSD(id_uav);
			});

		if($("#div_QtbUavSelect span").length>0)
			$($("#div_QtbUavSelect span")[0]).trigger("click");
		showDiv("div_main,div_QtbUavSelect");
	}
}


function reportBSD(id_uav)
{
	$('#BSDReportContent').text('...processing...');
	var params=[];
	params.push({name: 'op',value :'BSDReportPost'});
	params.push({name: 'id_uav',value : id_uav});

	$.ajax({
			url: "include/reports.php",
			data: params,
			type: "post",
			async: true,
			success: function(data) 
			{
				data=getData(data);
				if(data!="")
				{
					if(data.message.length>0)
					{
						errorbox(data.message);
						return;
					}
					$('#BSDReportContent').text('');
					$('#BSDReportContent').append(buildBSDReport(data.uav_sn,data.uav_sign,data.rows));
				}
			}
		});	
}

function buildBSDReport(uav_sn,uav_sign,rows)
{
	var table=$('<table></table>');
/*	table.append(
		$('<colgroup></colgroup>').attr("span","3").attr("width","12"),
		$('<colgroup></colgroup>').attr("width","47"),
		$('<colgroup></colgroup>').attr("width","184"),
		$('<colgroup></colgroup>').attr("width","333"),
		$('<colgroup></colgroup>').attr("width","92"),
		$('<colgroup></colgroup>').attr("width","145"));*/
	table.append(
		$('<tr></tr>').addClass("header").append(
			$('<td></td>').attr("colspan","6").attr("rowspan","2").text("CONFIGURATION LIST VELIVOLO S/N "+uav_sn+" ("+uav_sign+")"),
			$('<td></td>').attr("colspan","2").text("DATA DI AGGIORNAMENTO")),
		$('<tr></tr>').addClass("header").append(
			$('<td></td>').attr("colspan","2").attr("id","UPDATE_DATE")),
		$('<tr></tr>').append(
			$('<td></td>').attr("height","5").attr("colspan","8")),
		$('<tr></tr>').addClass("header").append(
			$('<td></td>').attr("colspan","4").text("LIVELLO DI DIPENDENZA"),
			$('<td></td>').text("PART NUMBER CODICE MATERIALE"),
			$('<td></td>').text("DESCRIZIONE ASSIEME / COMPONENTE"),
			$('<td></td>').text("S/N"),
			$('<td></td>').text("DATA DI INSTALLAZIONE / VERIFICA")),
		$('<tr></tr>').append(
			$('<td></td>').attr("height","5").attr("colspan","8"))
	);



	var update_date="";
	var update_date_formatted="";

	$.each(rows,function(k,v)
	{
		var livello=(v.livello?v.livello:"");
		var l=livello.split(".").length;
		var la=["","","",""];
		var pn=(v.pn?v.pn:"");
		var description=v.description;
		var sn=(v.sn?v.sn:"");
		var install_date=(v.install_date?v.install_date:"");
		var install_date_formatted=(v.install_date_formatted?v.install_date_formatted:"");
		la[l-1]=livello;
		if(install_date>update_date)
		{
			update_date=install_date;
			update_date_formatted=install_date_formatted;
		}
		if((v.optional==1)&&(l==2))
			la[0]="OPT.";

		var tdclass=(v.just_title==1?"header":"");


		$('<tr></tr>').addClass("centra").append(
			$('<td></td>').text(la[0]),
			$('<td></td>').text(la[1]),
			$('<td></td>').text(la[2]),
			$('<td></td>').text(la[3]),
			$('<td></td>').text(pn),
			$('<td></td>').text(description),
			$('<td></td>').addClass(tdclass).text(sn),
			$('<td></td>').addClass(tdclass).text(install_date_formatted)
		).appendTo(table);

	});
	table.find("#UPDATE_DATE").html(update_date_formatted);
	return table;
}
