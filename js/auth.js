function auth()
{
	$.post('include/auth.php', { op: "check" }, function(data)
		{
			data=getData(data);
			if(data.length==0)
				return;
			var out=parseInt(data.is_logged);
			var message=data.message;
			var nome=data.nome;
			var user_id=data.user_id;

			$("#user_id").val(user_id);

			notify(out,message);
	
			if(out==0)
			{
				main();
				$("#titolo1").html(nome);
			}
			else
				show_login();
		});
}

function show_login()
{
	show_headers(false);
	showWait();
	$.post('include/auth.php', 
		{ 
			op: "show_login" 
		}, 
		function(data) 
		{
			$('#div_auth').html(data);
			showDiv("div_auth");
			initializeLogin();
		});
}


function initializeLogin()
{
	$(':input').keypress(
	function(e) 
	{
		var keycode = (e.keyCode ? e.keyCode : e.which);
		if(keycode == '13')
			$("[name='login']").click();
	});
	$('[name=password]').val("");
	$('[name=user]').val("");
	$('[name=user]').focus();
}

function login_click(random_string)
{
	var user=$('[name=user]').val();
	var pass=hex_md5(random_string+hex_md5($('[name=password]').val()));
	showWait();
	$.post('include/auth.php', { op: "do_login", user: user, password: pass }, function(data)
		{
			data=getData(data);
			if(data.length==0)
				return;
			var out=parseInt(data.is_logged);
			var message=data.message;
			var nome=data.nome;
			var user_id=data.user_id;

			notify(out,message);
			$("#user_id").val(user_id);

			switch(out)
			{
				case 0:
					main();
					$('#titolo1').html(nome);
					break;
				case 1:
					show_login();
					break;
				case 2:
					show_expired();
					break;
			}
		});
}

function do_logout()
{
	show_headers(false);
	showWait();
	$.post('include/auth.php', { op: "do_logout" }, function(data) 
	{
		$('#div_auth').html(data);
		showDiv("div_auth");
		initializeLogin();
		$("#user_id").val("");
	});
}

function show_forgotten()
{
	show_headers(false);
	$.post('include/auth.php', { op: "show_forgotten" }, function(data) {
		$('#div_forgotten').html(data);
		showDiv("div_forgotten");
		$('[name=loginuser]').val("");
		$('[name=email]').val("");
		$('[name=loginuser]').focus();
		$("#user_id").val("");
		});

}

function post_forgotten()
{
	var user=$('[name=loginuser]').val();
	var email=$('[name=email]').val();

	$.post('include/auth.php', { op: "post_forgotten", user: user, email: email }, function(data)
		{
			data=getData(data);
			if(data.length==0)
				return;
			var out=parseInt(data.is_logged);
			var message=data.message;
			var nome=data.nome;
			notify(out,message);

			switch(out)
			{
				case 0:
					show_login();
					break;
				case 1:
					show_forgotten();
					break;
			}
		});
}

function show_expired()
{
	show_headers(false);
	$.post('include/auth.php', { op: "show_expired" }, function(data) 
	{
		$('#div_expired').html(data);
		$('[name=password1]').val("");
		$('[name=password2]').val("");
		showDiv("div_expired");
		$('[name=password1]').focus();
	});
}
function post_new_password()
{
	var password1=hex_md5($('[name=password1]').val());
	var password2=hex_md5($('[name=password2]').val());
	var id=$('[name=id]').val();

	if(password1!=password2)
	{
		notify(1,"le password non coincidono");
		return;
	}

	$.post('include/auth.php', { op: "post_new_password", id: id, password: password1 }, function(data)
		{
			data=getData(data);
			if(data.length==0)
				return;
			var out=parseInt(data.is_logged);
			var message=data.message;
			var nome=data.nome;
			notify(out,message);

			switch(out)
			{
				case 0:
					main();
					$('#titolo1').html(nome);
					break;
				case 1:
					show_expired();
					break;
			}
		});
}
