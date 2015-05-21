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

	$sql="SELECT crew.id 
		FROM crew 
		$where";

	$result = $conn->do_query($sql);
	$total = $result->num_rows;
	$result->close();


	$sql="SELECT crew.id,
				crew.name,
				crew.active
			FROM crew 
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
					$row['name'],
					$row['active']
				)
		);
	}
	echo json_encode($data);
	die();
}
elseif($op=='edit')
{
	$fields=array(
		"name"=>array("value"=>"","label"=>"Name"),
		"active"=>array("value"=>"","label"=>"Active")
		);

	$id_value=substr($_POST["id"],3);
	$id_field="id";

	require_once("forms.php");
	$title="Edit crew";
	showForm("$id_field,$id_value","crew",$fields,$title);
	die();
}
elseif($op=='add')
{
	$fields=array(
		"name"=>array("value"=>"","label"=>"Name"),
		"active"=>array("value"=>"","label"=>"Active")
		);

	require_once("forms.php");
	$title="Insert crew";
	showForm("","crew",$fields,$title);
	die();
}
elseif($op=='delete')
{
	$id_value=substr($_POST["id"],3);
	require_once("mysql.php");
	$conn=new mysqlConnection;
	$q="DELETE crew.* FROM crew LEFT JOIN qtb ON crew.id=qtb.pilot_id OR crew.id=qtb.pilot_2_id OR crew.id=qtb.pilot_3_id OR crew.id=qtb.pilot_4_id 
				WHERE crew.id='$id_value' AND qtb.id IS NULL";
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
