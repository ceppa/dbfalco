<?php
require_once("const.php");
require_once("../config.php");


function make_key() 
{
	$random_string = '';
	for($i=0;$i<32;$i++) 
		$random_string .= chr(rand(97,122));
	return $random_string;
}

function get_random_string()
{
	$_SESSION['key']=(isset($_SESSION['key'])?$_SESSION['key']:"");
	if (strlen($_SESSION['key']))
		$random_string = $_SESSION['key'];
	else
		$random_string = $_SESSION['key'] = make_key();

	return $random_string;
}

function show_login()
{
	$random_string=get_random_string();
?>
	<table border="0" cellspacing="0" cellpadding="0" style="margin-left:auto;margin-right:auto;">
		<tr>
			<td style="text-align:center;height:200px;vertical-align:middle">

	<form id="loginform" name="loginform" style="text-align:center;padding:0px">
		<table class="AcqStile4">
			<tr class="middle">
				<td class="AcqStile3" style="text-align:right;padding:0px 0px;">
					User
				</td>
				<td colspan="2" style="text-align:left;padding-left:5px;">
					<input name="user" type="text" id="user" size="20" />
				</td>
			</tr>
			<tr class="middle">
				<td height="50" class="AcqStile3" style="text-align:right;padding:0px;">
					Password 
				</td>
				<td style="white-space:nowrap;text-align:left;padding-left:5px;" align="left">
					<input name="password" type="password" id="password" size="12" />
				</td>
				<td style="text-align:right;padding:0px;">
					<input name="login" type="button" 
						class="button" 
						title="invia" 
						alt="invia" 
						value="invia"
						onclick="login_click('<?=$random_string?>')"
						align="top" width="60" />
				</td>
			</tr>
<!--			<tr class="middle">
				<td colspan="3" style="text-align:center">
					<div onmouseover="style.cursor='pointer'" 
						style="text-align:center;font-size:10px;color:#666666;"
							onclick="show_forgotten()">
							Hai dimenticato la password?
					</div>
				</td>
			</tr>-->
		</table>
	</form>
			</td>
		</tr>
	</table>

<?php
}


$op=$_REQUEST["op"];

if($op=='check')
{
	require_once("mysql.php");

	$is_logged=false;

	$random_string=get_random_string();
	$address_is_good=false;

	// check their IP address..
	if ((isset($_SESSION['remote_addr'])) &&
			($_SERVER['REMOTE_ADDR'] == $_SESSION['remote_addr'])) 
		$address_is_good = true;
	else
		$_SESSION['remote_addr'] = $_SERVER['REMOTE_ADDR'];

	// check their user agent..
	if ((isset($_SESSION['agent'])) && 
			($_SERVER['HTTP_USER_AGENT'] == $_SESSION['agent']))
		$agent_is_good = true;
	else
		$_SESSION['agent'] = $_SERVER['HTTP_USER_AGENT'];

	$_SESSION["pass"]=(isset($_SESSION["pass"])?$_SESSION["pass"]:"");
	$combined_hash = md5($random_string.$_SESSION["pass"]);
	if (@$_SESSION['session_pass'] == md5($combined_hash))
	{
		if((($address_is_good == true) and ($agent_is_good == true)))
			$is_logged = true;
		else
			$message = 'chi sei!?!';
	}
	
	if($is_logged)
		$nome=trim($_SESSION["nome"]." ".$_SESSION["cognome"]);
	else
		$nome="";
	$message=(isset($message)?$message:"");
	$_SESSION["id"]=(isset($_SESSION["id"])?$_SESSION["id"]:"");
	$out=array(
		"is_logged"=>($is_logged?'0':'1'),
		"message"=>"$message",
		"nome"=>"$nome",
		"user_id"=>$_SESSION["id"]
		);
	echo json_encode($out);
	die();
}
elseif($op=='do_logout') 
{
	$_SESSION['key']="";
	$_SESSION['key']=get_random_string();
//	session_unset();
//	session_destroy();
	show_login();
	die();
}
elseif($op=='show_login')
{
	show_login();
}
elseif($op=='do_login')
{
//	is_logged=0: ok;
//	is_logged=1: wrong;
//	is_logged=2: expired;

	require_once("mysql.php");

	$random_string=get_random_string();
	$is_logged=1;

	$conn=new mysqlConnection;
	$user=$_POST["user"];
	$hash=$_POST["password"];

	$query="SELECT users.*,GROUP_CONCAT(DISTINCT IFNULL(users_fleet.id_fleet,'') SEPARATOR ',' ) AS id_fleet
			FROM users LEFT JOIN users_fleet
			ON users.id=users_fleet.id_users or users.livello=3
			LEFT JOIN fleet ON users_fleet.id_fleet=fleet.id
			WHERE login='$user' AND users.attivo=1 AND fleet.active=1";

	$result=$conn->do_query($query);
	$login=$conn->result_to_array($result,false);
	$conn=null;

	if(count($login))
	{
		$row=$login[0];
		$combined_hash = md5($random_string.$row['pass']);
		// u da man!

		if ($hash == $combined_hash)
		{
			if($row['expired']==1)
			{
				$message = 'password scaduta';
				$is_logged=2;
				$_SESSION['id']=$row['id'];
				$_SESSION['nome']=$row['nome'];
				$_SESSION['cognome']=$row['cognome'];
			}
			else
			{
				$_SESSION['count']=0;
				$_SESSION['login_at'] = time();
				$_SESSION['session_pass'] = md5($combined_hash);
				$_SESSION['pass']=$row['pass'];
				$_SESSION['id']=$row['id'];
				$_SESSION['livello']=$row['livello'];
				$_SESSION['nome']=$row['nome'];
				$_SESSION['cognome']=$row['cognome'];
				$_SESSION['warehouse']=$row['warehouse'];
				$_SESSION['id_fleet']=(strlen($row['id_fleet'])?$row['id_fleet']:0);
				$_SESSION['qtb']=$row['qtb'];
				$is_logged=0;
			}
		}
	 	else
		{
			@$_SESSION['count']++;
			$is_logged=1;
			$message = 'password incorretta!';
		}
	}
	else
	{
		$is_logged=1;
		$message = "$user: utente sconosciuto";
		@$_SESSION['count']++;
	}

	if($is_logged==0)
		$nome=trim($_SESSION["nome"]." ".$_SESSION["cognome"]);
	else
		$nome="";


	$message=(isset($message)?$message:"");

	$out=array(
		"is_logged"=>$is_logged,
		"message"=>"$message",
		"nome"=>"$nome",
		"user_id"=>$_SESSION['id']
		);
	echo json_encode($out);
	die();
}
elseif($op=="show_forgotten")
{
?>
	<table border="0" cellspacing="0" cellpadding="0" style="margin-left:auto;margin-right:auto;">
		<tr>
			<td style="text-align:center;height:200px;vertical-align:middle">
        		<form name="passform">
				<table class="login_form">
					<tr>
						<td class="right">User:</td>
						<td class="left">
							<input type="text" class="input" size="21" name="loginuser">
						</td>
					</tr>
					<tr>
        				<td class="right">Indirizzo email:</td>
						<td class="left">
        					<input type="text" class="input" size="30" name="email">
						</td>
					</tr>
					<tr>
        				<td colspan="2" align="center">
							<input type="button" class="button" 
								name="send" value="Invia" onclick="post_forgotten()">
							<input type="button" class="button" 
								name="send" value="Annulla" onclick="show_login()">
						</td>
					</tr>
				</table>
				</form>
			</td>
		</tr>
	</table>
	<br>
	<div style="text-align:center">
	Inserire il proprio nome utente e l'indirizzo e-mail associato<br>
	verrà inviata una mail contenente la nuova password all'indirizzo specificato<br>
	</div>
<?php
}
elseif($op=="post_forgotten")
{
	require_once("mysql.php");

	$random_string=get_random_string();
	$conn=new mysqlConnection;
	$loginuser=$_POST["user"];
	$email=$_POST["email"];
	$query="SELECT id,nome,cognome,login,email 
		FROM users WHERE login='$loginuser' AND email='$email'";

	$result=$conn->do_query($query);
	$login=$conn->result_to_array($result,false);
	if(count($login)==0)
	{
		$is_logged=1;
		$message="nessun utente corrisponde ai criteri impostati $loginuser $email";
	}
	else
	{
		require_once("pwgenerator.php");
		$row=$login[0];
		$id=$row["id"];
		$email=$row["email"];

		$pass=randomPass();
		$query="UPDATE users SET pass=MD5('$pass'),expired=1 WHERE id='$id'";
		$conn->do_query($query);

		require_once("mail.php");
		$from = "System Administrator <noreply@hightecservice.biz>";
		$to = $row["nome"]." ".$row["cognome"]." <".$_POST["email"].">";
		$subject = "invio password";

		$mailtext=file_get_contents("../template/mailTemplateNewPass.html");
		$mailtext=str_replace("{username}",$row["login"],$mailtext);
		$mailtext=str_replace("{password}",$pass,$mailtext);
		$mailtext=str_replace("{name}",$row["nome"],$mailtext);
		$mailtext=str_replace("{surname}",$row["cognome"],$mailtext);
		$mailtext=str_replace("{siteAddress}","http://".$_SERVER["HTTP_HOST"],$mailtext);
		emailHtml($from, $subject, $mailtext, $to);

		$message="password inviata a $email";
		$is_logged=0;
	}	
	$conn=null;
	$out=array(
		"is_logged"=>$is_logged,
		"message"=>"$message",
		"nome"=>"$nome",
		"user_id"=>$_SESSION['id']
		);
	echo json_encode($out);
	die();
}
elseif($op=="show_expired")
{?>
	<table border="0" cellspacing="0" cellpadding="0" style="margin-left:auto;margin-right:auto;">
		<tr>
			<td style="text-align:center;height:200px;vertical-align:middle">
	<form name="loginform" 
			style="text-align:center;padding:0px">
		<input type="hidden" name="id" value="<?=$_SESSION["id"]?>" />
		<table class="AcqStile4">
			<tr class="middle">
				<td class="AcqStile3" style="text-align:right;padding:0px 0px;">
					nuova password
				</td>
				<td style="text-align:left;padding-left:5px;">
					<input name="password1" type="password" id="password1" size="12" />
				</td>
			</tr>
			<tr class="middle">
				<td height="50" class="AcqStile3" style="text-align:right;padding:0px;">
					ripeti password 
				</td>
				<td style="white-space:nowrap;text-align:left;padding-left:5px;" align="left">
					<input name="password2" type="password" id="password2" size="12" />
				</td>
			</tr>
			<tr>
				<td colspan="2" style="text-align:center">
					<input name="send" type="button" 
						title="invia" 
						alt="invia" 
						value="invia" 
						class="button"
						onclick="post_new_password()" 
						align="top" width="60" />
				</td>
			</tr>
		</table>
	</form>
			</td>
		</tr>
	</table>
<?php
}
elseif($op=="post_new_password")
{
	require_once("mysql.php");

	$id=$_POST['id'];
	$pass=$_POST['password'];
	$conn=new mysqlConnection;
	$query="UPDATE users SET expired=0,pass='$pass' WHERE id='$id'";
	$conn->do_query($query);

	$query="SELECT users.* FROM users WHERE users.id='$id'";
	$result=$conn->do_query($query);
	$login=$conn->result_to_array($result,false);
	$conn=null;

	$row=$login[0];
	$random_string=get_random_string();
	$message="Password updated";
	$combined_hash = md5($random_string.$row['pass']);

	$_SESSION['login_at'] = time();
	$_SESSION['session_pass'] = md5($combined_hash);
	$_SESSION['pass']=$row['pass'];
	$_SESSION['id']=$row['id'];
	$_SESSION['livello']=$row['livello'];
	$_SESSION['nome']=$row['nome'];
	$_SESSION['cognome']=$row['cognome'];

	$nome=trim($_SESSION["nome"]." ".$_SESSION["cognome"]);
	$out=array(
		"is_logged"=>0,
		"message"=>"$message",
		"nome"=>"$nome",
		"user_id"=>$_SESSION['id']
		);
	echo json_encode($out);
	die();
}
