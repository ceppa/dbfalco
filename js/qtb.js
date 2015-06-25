var pilotFields=[ "pilot_id", "pilot_2_id","pilot_3_id","pilot_4_id" ];

function buildQtbMenu()
{
	var ok=true;
	if($("#div_QtbUavSelect").length==0)
	{
		ok=false;
		var body="";
		$.ajax({
			type:'POST',
			url:'include/qtb.php',
			data:
				{
					op:"showUavMenu"
				},
			cache: false,
			async: false
		}).done(function(data)
			{
				data=getData(data);
				if(data.length==0)
					return;
				var status=parseInt(data.status);
				if(status!=0)
				{
					var message=data.message;
					notify(status,message);
					ok=false;
				}
				else
				{
					ok=true;
					body=data.body;
				}
			});
		if(ok)
			$("#content").prepend(body);
	}
	else
	{
		$('#div_QtbUavSelect a').remove();
	}

	return ok;
}

function menu_qtb_list_click()
{
	showWait("div_QtbUavSelect");

	if(buildQtbMenu())
	{
		$("#UAV_incomplete").hover(function()
				{
					var l=$(this).position().left+"px";
					$("#UAV_incomplete_details").css({left: l});
					$(this).find("#UAV_incomplete_details").show();
				}
				,function()
				{
					$(this).find("#UAV_incomplete_details").hide();
				}
			   );

		$("#div_QtbUavSelect span").unbind("click").click(function()
			{
				var id_uav=this.id.split("_")[1];
				if(id_uav=="incomplete")
					return;
				$("#UAV_incomplete").hide();

				$("#div_QtbUavSelect span").removeClass("active");
				$(this).addClass("active");
				qtbList(id_uav);
			});

		if($("#div_QtbUavSelect span").length>0)
			$($("#div_QtbUavSelect span")[0]).trigger("click");
		showDiv("div_flexi,div_QtbUavSelect");
	}
	else
		showDiv("div_main");
}


function qtbList(id_uav)
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
			url: 'include/qtb.php',
			params: [{name:'op',value:'list'},{name:'uav_id',value:id_uav}],
			dataType: 'json',
			showToggleBtn: false,
			colModel :
			[
				{
					display: 'Data',
					name : 'qtb.record_data',
					width : 150,
					sortable : true,
					align: 'left'
				},
				{
					display: 'From',
					name : 'airport_from.IATA',
					width : 150,
					sortable : true,
					align: 'left'
				},
				{
					display: 'To',
					name : 'airport_to.IATA',
					width : 150,
					sortable : true,
					align: 'left'
				},
				{
					display: 'Pilot',
					name : 'pilot',
					width : 150,
					sortable : true,
					align: 'left'
				},
				{
					display: 'Pilot 2',
					name : 'pilot_2',
					width : 150,
					sortable : true,
					align: 'left'
				},
				{
					display: 'Pilot 3',
					name : 'pilot_3',
					width : 150,
					sortable : true,
					align: 'left'
				},
				{
					display: 'Pilot 4',
					name : 'pilot_4',
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
					onpress : qtbAdd
				},
				{
					name: 'Edit',
					bclass: 'edit',
					onpress : qtbEdit
				},
				{
					separator: true
				}
			],
			searchitems :
			[
				{
					display: 'Data',
					name : 'qtb.record_data',
					isdefault: true
				},
				{
					display: 'From',
					name : 'airport_from.IATA'
				},
				{
					display: 'To',
					name : 'airport_to.IATA'
				}
			],
			onSuccess: function()
			{
//				$(".bDiv").height("auto");
			},
			sortname: "qtb.record_data",
			sortorder: "desc",
			usepager: true,
			singleSelect: true,
			useRp: true,
			rp: 15,
			qtype: "qtb.record_data",
//			query: (search?"ß":""),
			width: 'auto',
			height: 'auto',
			onRowSelected:qtb_row_selected,
			onRowSelectedClick:qtb_row_selected_click
		}
	);
/*	if(search)
	{
		$('.sDiv').show();
		$('.qsbox').focus();
	}
	else
		$('.sDiv').hide();*/
	showDiv("div_flexi,div_QtbUavSelect");
	checkBsdComplete(id_uav,"9999-99-99");

	resetButtons();
}

function qtb_row_selected(itemId,row,grid)
{
	flexiItemId=itemId;
	$('.edit').show();

}

function qtb_row_selected_click(itemId,row,grid)
{
	qtbEdit();
}


function qtbAdd()
{
	showWait("div_QtbUavSelect");
	$.post('include/qtb.php', { op: "add"},
		function(data)
		{
			data=getData(data);
			$('#div_main').html(data.form);
			$('#pilot_id').change(pilotCollision);
			$('#pilot_2_id').change(pilotCollision);
			$('#pilot_3_id').change(pilotCollision);
			$('#pilot_4_id').change(pilotCollision);
			$('#pilot_time').ForceNumericOnly();
			$('#pilot_2_time').ForceNumericOnly();
			$('#pilot_3_time').ForceNumericOnly();
			$('#pilot_3_time').ForceNumericOnly();
			$('#block_off').ForceNumericOnly();
			$('#block_off').ForceNumericOnly();
			$('#block_off').ForceNumericOnly();
			$('#block_off').ForceNumericOnly();
			$('#block_on').ForceNumericOnly();
			$('#stick_off').ForceNumericOnly();
			$('#stick_on').ForceNumericOnly();
			$('#hobbs_off').ForceNumericOnly();
			$('#hobbs_on').ForceNumericOnly();
			$('#cycles').ForceNumericOnly();
			$("#record_data").datetimepicker({ timeFormat: 'HH:mm:ss',dateFormat: "yy-mm-dd" });
			$('#record_data').datetimepicker('setDate', (new Date()));
			$('#record_data').change(function()
				{
					var uav_id=$("#div_QtbUavSelect").find('.active')[0].id.split("_")[1];
					var date=this.value;
					checkBsdComplete(uav_id,date);
				});
			$('#record_data').trigger("change");

			$('formTitle').html("UAV "+$('formTitle').html());
			$('#submit').bind('click', qtb_form_submit);
			$('#cancel').bind('click', qtb_form_cancel);
			showDiv("div_main,div_QtbUavSelect");
		}
	);
}

function qtb_form_submit()
{
	var notnull=new Array("record_data","block_off","block_on","stick_off","stick_on","cycles","hobbs_on","hobbs_off");
	var magzero=new Array("apt_from_id","apt_to_id","pilot_id","pilot_time");
	var ok=true;

	if($("input[name='id_edit']").length)
	{
		if(!$("#editform").data('changed'))
		{
			qtb_form_cancel();
			return;
		}
		$("input[name='id_edit']").attr("name","replaces_qtb_id").val(function( i, val )
			{
				return val.split(",")[1];
			});
	}

	ok=checkPilots();
	ok&=form_validate(notnull,magzero);
	if(ok)
	{
		var uav_id=$("#div_QtbUavSelect").find('.active')[0].id.split("_")[1];
		var date=$("#record_data").val();
		checkBsdComplete(uav_id,date);

		if($("#UAV_incomplete_details").html().length)
		{
			alert("UAV configuration is not complete");
			return;
		}

		$("#editform").append($('<input>').attr(
				{
					type: "hidden",
					name: "uav_id",
					value: uav_id
				}));

		form_post("qtb");
		$(".flexme").flexReload();
		resetButtons();
		showDiv("div_flexi,div_QtbUavSelect");
	}
}

function qtb_form_cancel()
{
	$("#UAV_incomplete").hide();
	showDiv("div_flexi,div_QtbUavSelect");
}


function qtbEdit()
{
	showWait("div_QtbUavSelect");
	$.post('include/qtb.php', { op: "edit", id:  flexiItemId},
		function(data)
		{
			data=getData(data);
			$('#div_main').html(data.form);
			$('#pilot_id').change(pilotCollision);
			$('#pilot_2_id').change(pilotCollision);
			$('#pilot_3_id').change(pilotCollision);
			$('#pilot_4_id').change(pilotCollision);
			$('#pilot_time').ForceNumericOnly();
			$('#pilot_2_time').ForceNumericOnly();
			$('#pilot_3_time').ForceNumericOnly();
			$('#pilot_3_time').ForceNumericOnly();
			$('#block_off').ForceNumericOnly();
			$('#block_off').ForceNumericOnly();
			$('#block_off').ForceNumericOnly();
			$('#block_off').ForceNumericOnly();
			$('#block_on').ForceNumericOnly();
			$('#stick_off').ForceNumericOnly();
			$('#stick_on').ForceNumericOnly();
			$('#hobbs_off').ForceNumericOnly();
			$('#hobbs_on').ForceNumericOnly();
			$('#cycles').ForceNumericOnly();
			$("#record_data").datetimepicker({ timeFormat: 'HH:mm:ss',dateFormat: "yy-mm-dd" });
//			$('#record_data').datetimepicker('setDate', (new Date()));
			$('#record_data').change(function()
				{
					var uav_id=$("#div_QtbUavSelect").find('.active')[0].id.split("_")[1];
					var date=this.value;
					checkBsdComplete(uav_id,date);
				});
//			$('#record_data').trigger("change");

			$('formTitle').html("UAV "+$('formTitle').html());
			$('#submit').bind('click', qtb_form_submit);
			$('#cancel').bind('click', qtb_form_cancel);
			showDiv("div_main,div_QtbUavSelect");
			$("#editform :input").change(function()
			{
				$(this).closest('form').data('changed', true);
			});
		}
	);
}

function checkBsdComplete(uav_id,date)
{
	$.post('include/qtb.php', { op: "checkBsdComplete",date: date, uav_id:uav_id },
		function(data)
		{
			data=getData(data);
			$("#UAV_incomplete_details").html("");
			var table=buildIncompleteTable(data);
			if(table.html().length)  //UAV is incomplete
			{
				$("#UAV_incomplete_details").append(table);
				$("#UAV_incomplete").show();
			}
			else
				$("#UAV_incomplete").hide();
		}
	);
}

function buildIncompleteTable(data)
{
	var out=$("<table>").addClass("append");
	$.each(data, function( index, value )
	{
		out.append($("<tr>").append($("<td>").html(value.description)));
	});
	return out;
}

function pilotCollision(e)
{
	var sender=$(this).attr("id");
	var val=$(this).val();
	$.each(pilotFields,function( index, id)
		{
			if(sender=="pilot_id")
			{
				if((id!=sender)&&($("#"+id).val()==val))
					$("#"+id).val(0);
			}
			else
			{
				if((id!=sender)&&($("#"+id).val()==val))
					$("#"+sender).val(0);
			}
		});
}

function checkPilots()
{
	var out=true;
	$.each(pilotFields,function( index, id)
		{
			var t=id.substr(0,id.length-2)+"time";
			$("#"+id).removeClass("error");
			$("#"+t).removeClass("error");
			if($("#"+id).val()>0)
			{
				if(($("#"+t).val().length==0)||Number($("#"+t).val()==0))
					$("#"+t).addClass("error");
			}
			else
			{
				if(Number($("#"+t).val()>0))
					$("#"+id).addClass("error");
			}
		});
	return out;
}
