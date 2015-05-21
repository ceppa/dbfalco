<?
require_once("const.php");
require_once("util.php");
require_once("../config.php");


$op=$_REQUEST["op"];


if($op=='list')
{
	$id_fleet=$_SESSION["id_fleet"];
	$where = "WHERE fleet.id IN($id_fleet)";
	if($_SESSION["livello"]==3)
		$where="WHERE 1";

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

	if($qtype) 
		$where.=" AND $qtype LIKE '%$query%'";

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

	$sql="SELECT fleet.id 
		FROM fleet 
		$where";

	$result = $conn->do_query($sql);
	$total = $result->num_rows;
	$result->close();


	$sql="SELECT fleet.id,fleet.description,fleet.operator
			FROM fleet 
		$where
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
					$row['description'],
					$row['operator']
				)
		);
	}
	echo json_encode($data);
	die();
}
elseif($op=='edit')
{
	$fields=array(
		"description"=>array("value"=>"","label"=>"Description"),
		"operator"=>array("value"=>"","label"=>"Operator")
		);

	$id_value=substr($_POST["id"],3);
	$id_field="id";

	require_once("forms.php");
	$title="Edit fleet";
	showForm("$id_field,$id_value","fleet",$fields,$title);
	die();
}
elseif($op=='add')
{
	$fields=array(
		"description"=>array("value"=>"","label"=>"Description"),
		"operator"=>array("value"=>"","label"=>"Operator")
		);

	require_once("forms.php");
	$title="Insert in fleet";
	showForm("","fleet",$fields,$title);
	die();
}
elseif($op=='delete')
{
	$id_value=substr($_POST["id"],3);
	require_once("mysql.php");
	$conn=new mysqlConnection;
	$q="DELETE FROM fleet WHERE id='$id_value'";
	$conn->do_query($q);
	$status=($conn->affected_rows()>0?0:1);
	$conn=null;
	$message=($status?"Nothing to delete":"Delete successful");
	$out=array
	(
		"status"=>$status,
		"message"=>"$message"
	);
	echo json_encode($out);
	die();
}
?>
