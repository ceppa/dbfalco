<?
require_once("const.php");
require_once("util.php");
require_once("../config.php");

$op=$_REQUEST["op"];


if($op=='list')
{
	require_once("mysql.php");
	$page = $_POST['page'];
	$rp = $_POST['rp'];
	$sortname = $_POST['sortname'];
	$sortorder = $_POST['sortorder'];

	if(!$sortname)
		$sortname="operator";
	if(!$sortorder)
		$sortorder="asc";

	$sort = "ORDER BY $sortname $sortorder";
	$query = $_REQUEST['query'];
	$qtype = $_REQUEST['qtype'];

	$where = "";

	$where="";
	if($qtype) 
		$where=" WHERE $qtype LIKE '%$query%'";

	if(!$page || !$rp)
	{
		$limit = "";
		$page = 1;
	}
	else
	{
		$start = (($page-1) * $rp);
		$limit = " LIMIT $start, $rp";
	}

	$conn=new mysqlConnection;

	$sql="SELECT users.id 
			FROM users 
		$where";

	$result = $conn->do_query($sql);
	$total = $result->num_rows;
	$result->close();


	$sql="SELECT users.id,users.login,
			users.nome,users.cognome,
			users_level.description AS livello,
			users.expired,users.attivo,
			GROUP_CONCAT(fleet.description) AS fleet
		FROM users LEFT JOIN users_level
			ON users.livello=users_level.id
			LEFT JOIN users_fleet ON users.id=users_fleet.id_users
			LEFT JOIN fleet ON users_fleet.id_fleet=fleet.id
		$where
		GROUP BY users.id
		$sort $limit";


	$result=$conn->do_query($sql);
	$rows=$conn->result_to_array($result,false);

	$conn=null;

	$data['page']=$page;
	$data['total']=$total;
	$data['rows']=array();
	foreach($rows as $row)
	{
		$id=$row["id"];
		$data['rows'][] = array
		(
			'id' => $id,
			'cell' => array
				(
					$row['login'],
					$row['nome'],
					$row['cognome'],
					$row['fleet'],
					$row['livello'],
					$row['expired'],
					$row['attivo']
				)
		);
	}
	echo json_encode($data);
	die();
}
elseif($op=='edit')
{
	$fields=array(
		"login"=>array("value"=>"","label"=>"Login"),
		"nome"=>array("value"=>"","label"=>"Name"),
		"cognome"=>array("value"=>"","label"=>"Surname"),
		"email"=>array("value"=>"","label"=>"Email"),
		"livello"=>array("value"=>"","label"=>"Level"
			,"link"=>array("table"=>"users_level"
			,"id"=>"id","text"=>"description")),
		"expired"=>array("value"=>"","label"=>"Expired"),
		"attivo"=>array("value"=>"","label"=>"Active"),
		"warehouse"=>array("value"=>"","label"=>"Access warehouse"),
		"qtb"=>array("value"=>"","label"=>"Access UTL")
		);

	$id_value=substr($_POST["id"],3);
	$id_field="id";

	require_once("forms.php");
	$title="Edit user";
	ob_start();
	showForm("$id_field,$id_value","users",$fields,$title);
	$form=ob_get_clean();
	$fleetform=buildFleetForm($id_value);
	echo json_encode(array("form"=>$form,"addon"=>$fleetform));
	die();
}
elseif($op=='add')
{
	$fields=array(
		"login"=>array("value"=>"","label"=>"Login"),
		"nome"=>array("value"=>"","label"=>"Name"),
		"cognome"=>array("value"=>"","label"=>"Surname"),
		"email"=>array("value"=>"","label"=>"Email"),
		"livello"=>array("value"=>"","label"=>"Level"
			,"link"=>array("table"=>"users_level"
			,"id"=>"id","text"=>"description")),
		"warehouse"=>array("value"=>"","label"=>"Access warehouse"),
		"qtb"=>array("value"=>"","label"=>"Access UTL")
		);

	require_once("forms.php");
	$title="Insert new user";
	ob_start();
	showForm("","users",$fields,$title);
	$form=ob_get_clean();
	$fleetform=buildFleetForm();
	echo json_encode(array("form"=>$form,"addon"=>$fleetform));
	die();
}
elseif($op=="checkduplicate")
{
	if(isset($_REQUEST["user"]))
	{
		$user=$_REQUEST["user"];
		$id=$_REQUEST["id"];
		require_once("mysql.php");
		$conn=new mysqlConnection;
		$query="SELECT id FROM users
				WHERE id!='$id' AND login='$user'";
		$result=$conn->do_query($query);
		$rows=$conn->result_to_array($result,true);
		$conn=null;
		
		echo count($rows);
	}
	die();
}
elseif($op=="postFleetAccess")
{
	$status=0;
	ob_start();
	require_once("mysql.php");
	$conn=new mysqlConnection;
	$fleetArray=$_POST["id_fleet"];
	$fleetList=implode(",",$fleetArray);
	$id_users=$_POST["id"];

	$insertList="";
	foreach($fleetArray as $id_fleet)
		$insertList.="($id_users,$id_fleet),";
	$insertList=rtrim($insertList,",");

	$conn->beginTransaction();

	$query="DELETE FROM users_fleet WHERE id_users='$id_users'";

	$result = $conn->do_query($query,false);
	if($result===true)
	{
		if(strlen($insertList))
		{
			$query="INSERT INTO users_fleet(id_users,id_fleet)
				VALUES $insertList";
			$result=$conn->do_query($query,false);
			if(!$result)
				$status=1;
		}
	}
	else
		$status=1;
	if($status==0)
		$conn->commit();
	else
		$conn->rollback();
	$message=ob_get_clean();

	$out=array
	(
		"status"=>$status,
		"message"=>"$message"
	);

	if(($status==0)&&($id_users==$_SESSION["id"]))
	{
		$q="SELECT GROUP_CONCAT(id_fleet) AS id_fleet FROM users_fleet
				WHERE id_users='$id_users'";
		$result=$conn->do_query($q,false);
		$r=$conn->result_to_array($result);
		$_SESSION["id_fleet"]=$r[0]["id_fleet"];
	}
	$conn=null;
	echo json_encode($out);
}


function buildFleetForm($id_users=0)
{
	require_once("mysql.php");
	$conn=new mysqlConnection;

	$sql="SELECT fleet.id as id_fleet, fleet.description, users_fleet.id_users 
			FROM fleet LEFT JOIN users_fleet ON fleet.id=users_fleet.id_fleet 
			AND users_fleet.id_users='$id_users' 
		ORDER BY fleet.description";

	$result = $conn->do_query($sql);
	$rows=$conn->result_to_array($result,false);
	$conn=null;
	ob_start();
?>
	<form name="fleetForm" id="fleetForm">
	<table class="form">
		<tr>
			<td class="formTitle" colspan="2">fleet access</td>
		</tr>
	<?
	foreach($rows as $row)
	{
		$checked=($row["id_users"]===$id_users?" checked='checked'":"");

	?>
		<tr>
			<td class="right"><?=$row["description"]?></td>
			<td class="left"><input type="checkbox" name="id_fleet[]"<?=$checked?> value="<?=$row["id_fleet"]?>"/></td>
		</tr>
<?	}?>
	</table>
	</form>
<?
	return ob_get_clean();
}

?>



