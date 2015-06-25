<?php
require_once("const.php");
require_once("util.php");
require_once("../config.php");

$op=$_REQUEST["op"];


if($op=='list')
{
	$id_fleet=$_SESSION["id_fleet"];
	$where = "WHERE uav.id_fleet IN($id_fleet)";
	if(isset($_SESSION["livello"])&&($_SESSION["livello"]==3))
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

	$sql="SELECT uav.id
			FROM uav LEFT JOIN fleet
			ON uav.id_fleet=fleet.id
		$where";

	$result = $conn->do_query($sql);
	$total = $result->num_rows;
	$result->close();


	$sql="SELECT uav.id,fleet.description AS fleet,
			uav.marche,uav.pn,uav.sn,uav.note,uav_type.description AS uav_type
			FROM uav LEFT JOIN fleet
			ON uav.id_fleet=fleet.id
			LEFT JOIN uav_type ON uav.uav_type_id=uav_type.id
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
					$row['uav_type'],
					$row['fleet'],
					$row['marche'],
					$row['pn'],
					$row['sn'],
					$row['note']
				)
		);
	}
	echo json_encode($data);
	die();
}
elseif($op=='edit')
{
	$id_fleet=$_SESSION["id_fleet"];
	$where = "id IN($id_fleet)";
	if(isset($_SESSION["livello"])&&($_SESSION["livello"]==3))
		$where="1";


	$fields=array(
		"id_fleet"=>array("value"=>"","label"=>"Fleet"
			,"link"=>array("table"=>"fleet"
			,"id"=>"id","text"=>"description","where"=>"$where")),
		"sn"=>array("value"=>"","label"=>"Serial Number"),
		"marche"=>array("value"=>"","label"=>"Marche"),
		"pn"=>array("value"=>"","label"=>"Part Number"),
		"uav_type_id"=>array("value"=>"","label"=>"Type"
			,"link"=>array("table"=>"uav_type"
			,"id"=>"id","text"=>"description")),
		"note"=>array("value"=>"","label"=>"Note")
		);

	$id_value=substr($_POST["id"],3);
	$id_field="id";

	require_once("forms.php");
	$title="Edit UAV";
	showForm("$id_field,$id_value","uav",$fields,$title);
	die();
}
elseif($op=='add')
{
	$id_fleet=$_SESSION["id_fleet"];
	$where = "id IN($id_fleet)";
	if(isset($_SESSION["livello"])&&($_SESSION["livello"]==3))
		$where="1";

	$fields=array(
		"id_fleet"=>array("value"=>"","label"=>"Fleet"
			,"link"=>array("table"=>"fleet"
			,"id"=>"id","text"=>"description","where"=>"$where")),
		"sn"=>array("value"=>"","label"=>"Serial Number"),
		"marche"=>array("value"=>"","label"=>"Marche"),
		"pn"=>array("value"=>"","label"=>"Part Number"),
		"uav_type_id"=>array("value"=>"","label"=>"Type"
			,"link"=>array("table"=>"uav_type"
			,"id"=>"id","text"=>"description")),
		"note"=>array("value"=>"","label"=>"Note")
		);

	require_once("forms.php");
	$title="Insert new UAV";
	showForm("","uav",$fields,$title);
	die();
}


?>
