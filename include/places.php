<?php
require_once("const.php");
require_once("util.php");
require_once("../config.php");

$op=$_REQUEST["op"];


if($op=='list')
{
	$id_fleet=$_SESSION["id_fleet"];
	$where = "WHERE id_fleet IN($id_fleet)";
	if($_SESSION["livello"]==3)
		$where="WHERE 1";

	require_once("mysql.php");
	$page = $_POST['page'];
	$rp = $_POST['rp'];
	$sortname = $_POST['sortname'];
	$sortorder = $_POST['sortorder'];

	if(!$sortname)
		$sortname="name";
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

	$sql="SELECT places.id 
			FROM places
		$where";

	$result = $conn->do_query($sql);
	$total = $result->num_rows;
	$result->close();


	$sql="SELECT places.id,
				places.name,
				places.description,
				places.address,
				places.contact_name,
				places.contact_email,
				places_types.name AS place_type,
				ifnull(fleet.description,'ALL FLEETS') AS fleet,
				places.enabled 
			FROM places
			LEFT JOIN places_types ON places.id_places_types=places_types.id
			LEFT JOIN fleet ON places.id_fleet=fleet.id
		$where
		GROUP BY places.id
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
					$row['description'],
					$row['place_type'],
					$row['fleet'],
					$row['address'],
					$row['contact_name'],
					$row['contact_email'],
					$row['enabled']
				)
		);
	}
	echo json_encode($data);
	die();
}
elseif($op=='edit')
{
	$comboinit="";
	$id_fleet=$_SESSION["id_fleet"];
	$where = "id IN($id_fleet)";
	if($_SESSION["livello"]==3)
	{
		$where="1";
		$comboinit="-1|ALL FLEETS";
	}

	$fields=array(
		"name"=>array("value"=>"","label"=>"Name"),
		"description"=>array("value"=>"","label"=>"Description"),
		"id_places_types"=>array("value"=>"","label"=>"Place Type"
			,"link"=>array("table"=>"places_types"
			,"id"=>"id","text"=>"name")),
		"address"=>array("value"=>"","label"=>"Address"),
		"contact_name"=>array("value"=>"","label"=>"Contact Name"),
		"contact_email"=>array("value"=>"","label"=>"Contact email"),
		"id_fleet"=>array("value"=>"","label"=>"Fleet"
			,"link"=>array("table"=>"fleet"
			,"id"=>"id","text"=>"description","where"=>$where,"comboinit"=>$comboinit)),
		"enabled"=>array("value"=>"","label"=>"Enabled"));

	$id_value=substr($_POST["id"],3);
	$id_field="id";

	require_once("forms.php");
	$title="Edit Place";

	ob_start();
	showForm("$id_field,$id_value","places",$fields,$title);
	$form=ob_get_clean();

	echo json_encode(array("form"=>$form));
	die();
}
elseif($op=='add')
{
	$comboinit="";
	$id_fleet=$_SESSION["id_fleet"];
	$where = "id IN($id_fleet)";
	if($_SESSION["livello"]==3)
	{
		$where="1";
		$comboinit="-1|ALL FLEETS";
	}

	$fields=array(
		"name"=>array("value"=>"","label"=>"Name"),
		"description"=>array("value"=>"","label"=>"Description"),
		"id_places_types"=>array("value"=>"","label"=>"Place Type"
			,"link"=>array("table"=>"places_types","id"=>"id","text"=>"name")),
		"address"=>array("value"=>"","label"=>"Address"),
		"contact_name"=>array("value"=>"","label"=>"Contact Name"),
		"contact_email"=>array("value"=>"","label"=>"Contact email"),
		"id_fleet"=>array("value"=>"","label"=>"Fleet"
			,"link"=>array("table"=>"fleet"
			,"id"=>"id","text"=>"description","where"=>$where,"comboinit"=>$comboinit)),
		"enabled"=>array("value"=>"","label"=>"Enabled"));

	require_once("forms.php");
	$title="Insert new place";
	ob_start();
	showForm("","places",$fields,$title);
	$form=ob_get_clean();
//	$fleetform=buildFleetForm(0);
//	echo json_encode(array("form"=>$form,"addon"=>$fleetform));
	echo json_encode(array("form"=>$form));
	die();
}
?>
