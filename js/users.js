function menu_users_list_click()
{
	listUsersButton_Click(false);
}

function menu_users_search_click()
{
	listUsersButton_Click(true);
}

function listUsersButton_Click(search)
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
			url: 'include/users.php',
			params: [{name:'op',value:'list'}],
			dataType: 'json',
			showToggleBtn: false,
			colModel : 
			[
				{
					display: 'Login', 
					name : 'users.login', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Nome', 
					name : 'users.nome', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Cognome', 
					name : 'users.cognome', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Flotte', 
					name : 'fleet', 
					width : 150, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Livello', 
					name : 'users_level.description', 
					width : 50, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Expired', 
					name : 'users.expired', 
					width : 50, 
					sortable : true, 
					align: 'left'
				},
				{
					display: 'Enabled', 
					name : 'users.attivo', 
					width : 50, 
					sortable : true, 
					align: 'left'
				}
			],
			buttons : 
			[
				{
					name: 'Add', 
					bclass: 'add', 
					onpress : userAdd
				},
				{
					name: 'Edit', 
					bclass: 'edit', 
					onpress : userEdit
				},
				{
					name: 'Delete', 
					bclass: 'delete', 
					onpress : userDelete
				},
				{
					name: 'Reset', 
					bclass: 'reset', 
					onpress : userReset
				},
				{
					separator: true
				}			
			],
			searchitems : 
			[
				{
					display: 'Login', 
					name : 'users.login',
					isdefault: true
				},
				{
					display: 'Nome', 
					name : 'users.nome'
				},
				{
					display: 'Cognome', 
					name : 'users.cognome'
				}
			],
			onSuccess: function()
			{	
//				$(".bDiv").height("auto");
			},
			onReply: flexiReply,
			sortname: "users.login",
			sortorder: "asc",
			usepager: true,
			singleSelect: true,
			useRp: true,
			rp: 15,
			qtype: "users.login",
			query: (search?"ß":""),
			width: 'auto',
			height: 'auto',
			onRowSelected:users_row_selected,
			onRowSelectedClick:users_row_selected_click
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




function users_row_selected(itemId,row,grid)
{
	flexiItemId=itemId;
	$('.edit').show();
	$('.delete').show();
	$('.reset').show();
}

function users_row_selected_click(itemId,row,grid)
{
	userEdit();
}

function menu_users_new_click()
{
	listUsersButton_Click(false);
	userAdd();
}


function userDelete()
{
}

function userAdd()
{
	showWait();
	$.post('include/users.php', { op: "add"}, 
		function(data) 
		{
			data=getData(data);
			$('#div_main').html(data.form);
			$('#div_main').append(data.addon);
			$('#submit').bind('click', users_form_submit);
			$('#cancel').bind('click', users_form_cancel);
			showDiv("div_main");
		});
}


function userEdit()
{
	showWait();
	$.post('include/users.php', { op: "edit", id:  flexiItemId}, 
		function(data) 
		{
			data=getData(data);
			$('#div_main').html(data.form);
			$('#div_main').append(data.addon);
			$('#submit').bind('click', users_form_submit);
			$('#cancel').bind('click', users_form_cancel);
			showDiv("div_main");
		});
}

function checklogin(utente)
{
	var ok=true;
	if(utente.length>0)
	{
		var id=(flexiItemId?flexiItemId.substr(3):0);
		$.ajax({
				type:'POST',
				url:'include/users.php', 
				data:{ op: "checkduplicate",id: id,user:utente },
				cache: false,
				async: false
			}).done(function(data) 
				{
					if(data!='0')
					{
						$("#login").addClass("error");
						$("#login_exists").show();
						ok=false;
					}
					else
					{
						$("#login").removeClass("error");
						$("#login_exists").hide();
						
					}
				});
	}
	else
	{
		$("#login").addClass("error");
		$("#login_exists").hide();
		ok=false;
	}
	return ok;
}

function users_form_submit()
{
	var notnull=new Array("nome","cognome");
	var magzero=new Array("livello");
	var ok;

	var utente=$("#login").val();
	ok=checklogin(utente);

	ok&=form_validate(notnull,magzero);
	if(!isEmail($("#email").val()))
	{
		$("#email").addClass("error");
		ok=false;
	}
	else
		$("#email").removeClass("error");


	if(ok)
	{
		
		var id_users=form_post("users");
		if((id_users==0)&&flexiItemId)
			id_users=flexiItemId.substr(3)
		if(Number(id_users)>0)
			postFleetAccess(id_users);
		$(".flexme").flexReload();
//		alert(flexiItemId);
		resetButtons();
		showDiv("div_flexi");
		$("#div_QtbUavSelect").remove();
	}
}


function postFleetAccess(id_users)
{
	var ok=false;
	var postdata="op=postFleetAccess&id="+id_users+"&";
	postdata+=$("#fleetForm").serialize();
	$.ajax({
			type:'POST',
			url:'include/users.php', 
			data: postdata,
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
					ok=true;
			});
	return ok;
}


function users_form_cancel()
{
	showDiv("div_flexi");
}


function userReset()
{
}

