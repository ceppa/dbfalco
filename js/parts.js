function menu_parts_list_click()
{
	listPartsButton_Click(false);
}

function menu_parts_search_click()
{
	listPartsButton_Click(true);
}

function listPartsButton_Click(search)
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
			url: 'include/parts.php',
			params: [{name:'op',value:'list'}],
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
					width : 250, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Supplier',
					name : 'supplier', 
					width : 100, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Manufacturer',
					name : 'manufacturer', 
					width : 100, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Documents',
					name : 'documents', 
					width : 100, 
					sortable : true, 
					align: 'left'
				}
			],
			buttons : 
			[
				{
					name: 'Edit', 
					bclass: 'edit', 
					onpress : partsEdit
				},
				{
					name: 'Details', 
					bclass: 'details', 
					onpress : partsDetails
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
					display: 'Manufacturer', 
					name : 'manufacturers.name'
				},
				{
					display: 'Supplier', 
					name : 'suppliers.name'
				}
			],
			onSuccess: function()
			{	
//				$(".bDiv").height("auto");
			},
			onReply: flexiReply,
			sortname: "parts.pn",
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
			onRowSelected:parts_row_selected,
			onRowSelectedClick:parts_row_selected_click
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



function parts_row_selected(itemId,row,grid)
{
	flexiItemId=itemId;
	$('.edit').show();
	$('.details').show();
}

function parts_row_selected_click(itemId,row,grid)
{
	partsEdit();
}


function partsDetails()
{
	showWait();
	$.post('include/parts.php', { op: "details", id:  flexiItemId}, 
		function(data) 
		{
			var id=flexiItemId.substr(3);
			data=getData(data);
			var part=data.part[id];
			var documents=data.documents;

			$('#div_main').html($('<div>').addClass('detail_div'));

			$('<input>').prop("type","button")
					.prop("class","cancel")
					.val("close")
					.click(function()
					{
						showDiv("div_flexi");
					}).appendTo($(".detail_div"));

			$('<table>').append(
				$('<tr>').append($('<td>').text('part details').attr('colspan',2)).addClass('header'),
				$('<tr>').append(
					$('<td>').text("pn"),$('<td>').text(part.pn)),
				$('<tr>').append(
					$('<td>').text("description"),$('<td>').text(part.description)),
				$('<tr>').append(
					$('<td>').text("supplier"),$('<td>').text(part.supplier)),
				$('<tr>').append(
					$('<td>').text("manufacturer"),$('<td>').text(part.manufacturer))
			).appendTo($(".detail_div")).addClass("header_table");
			$('<table>').append(
					$('<tr>').append($('<td>').text('related documents')).addClass('header')
				).addClass('form boxed').appendTo($(".detail_div")).attr('id','documents_table');
			$.each(documents, function(i, document) 
			{
				$('<tr>').append(
					$('<td>').html('<a href="#" onclick="showPartDoc('+document.id_documents+')">'+document.description+'</a>')
				).appendTo($("#documents_table"));
            });


			showDiv("div_main");

		});
}

function partsEdit()
{
	showWait();
	$.post('include/parts.php', { op: "edit", id:  flexiItemId}, 
		function(data) 
		{
			data=getData(data);
			documents=data.documents;
			$('#div_main').html(data.form);
			$('#submit').bind('click', function(){$('#editform').submit()});
//			$('#submit').bind('click', parts_form_submit);
			$('#cancel').bind('click', parts_form_cancel);
			

			if(documents.length)
			{
				$('<table>').append(
						$('<tr>').append($('<td>').text('related documents').attr('colspan',2)).addClass('header')
					).addClass('form boxed').appendTo($("#editform")).attr('id','documents_table');
	
				$.each(documents, function(i, document) 
				{
					$('<tr>').append(
						$('<td>').append(
								$("<input>").attr("type","button").attr("name","docdel").val("del").on("click",delDocument),
								$("<input>").attr("type","hidden").attr("name","id_documents[]").val(document.id_documents)
							),
						$('<td>').html('<a href="#" onclick="showPartDoc('+document.id_documents+')">'+document.description+'</a>')
					).appendTo($("#documents_table"));
	            });
			}
			initPartDocuments();
			$('#editform').attr("enctype","multipart/form-data");
			$('#editform').attr("action",'include/parts.php');
			$('#editform').attr("method",'post');7
			$("#editform").append($("<input>").attr("type","hidden").attr("name","op").val("do_edit"));
			showDiv("div_main");
			$('#editform').ajaxForm(
			{
				beforeSubmit:	
				function(formData, jqForm, options)
				{
					return parts_form_submit();
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
		});
}

function parts_form_submit()
{
	var notnull=new Array("pn");
	var magzero=new Array("id_suppliers");

	var ok=form_validate(notnull,magzero);
	ok=ok && validate_parts_documents();
	return ok;
}

function validate_parts_documents()
{
	var files=$("#part_documents input[name^='docfile_']");
	ok=true;
	for(i=0;i<files.length;i++)
	{
		var n=files[i].name.split("_")[1];
		var desc=$("#part_documents input[name='docdesc_"+n+"']")[0];
		$(desc).removeClass("error");

		if((files[i].value!="")&&(desc.value==""))
		{
			$(desc).addClass("error");
			ok=false;
		}
	}
	return ok;
}


function parts_form_cancel()
{
	showDiv("div_flexi");
}

function initPartDocuments()
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
			$('<td>').append($('<input>').attr("type","button").attr("class","cancel").attr("name","docdel_0").val("del").click(function()
					{
						delPartDoc(this);
					})),
			$('<td>').append($('<input>').attr("type","file").attr("class","cancel").attr("name","docfile_0")),
			$('<td>').append($('<input>').attr("type","text").attr("name","docdesc_0"))
		),
		$('<tr>').append
		(
			$('<td>').attr("colspan",3).append($('<input>').attr("type","button").attr("class","cancel").attr("name","docadd").val("add").click(function()
					{
						addPartDoc(this);
					}))
		)
	).attr("id","part_documents").addClass("form boxed").appendTo($("#editform"));
}

function delPartDoc(sender)
{
	if($("#part_documents tr").length>4)
		$(sender).closest('tr').remove();
}

function addPartDoc(sender)
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

function showPartDoc(id_files)
{
	window.open("include/parts.php?op=showDoc&id_files="+id_files);
}
