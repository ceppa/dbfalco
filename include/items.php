<?
require_once("const.php");
require_once("util.php");
require_once("../config.php");

$op=$_REQUEST["op"];


if($op=='list')
{
	$id_fleet=$_SESSION["id_fleet"];
	$where = "WHERE places.id_fleet IN($id_fleet)";
	if($_SESSION["livello"]==3)
		$where="WHERE 1";

	require_once("mysql.php");
	$page = $_POST['page'];
	$rp = $_POST['rp'];
	$sortname = $_POST['sortname'];
	$sortorder = $_POST['sortorder'];

	if(!$sortname)
		$sortname="parts.description";
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

	$sql="SELECT items_grouped.id,
					parts.pn,
					parts.description AS description,
					items_grouped.sn,
					items_grouped.licence_number,
					items_grouped.licence_name,
					manufacturers.name AS manufacturer,
					suppliers.name AS supplier,
					items_grouped.location AS location,
					items_grouped.position AS position,
					places.name AS place,
					COUNT(DISTINCT items_grouped.id) AS qty,
					bsd.description as bsd,
					owners.description AS owner,
					IFNULL(fleet.description,'ALL FLEETS') AS fleet,
					licence_types.description AS licence_type
				FROM items_grouped LEFT JOIN parts
					ON items_grouped.id_parts=parts.id
				LEFT JOIN owners
					ON items_grouped.id_owners=owners.id
				LEFT JOIN licence_types
					ON items_grouped.licence_type=licence_types.id
				LEFT JOIN places AS manufacturers
					ON parts.id_manufacturers=manufacturers.id
				LEFT JOIN places AS suppliers
					ON parts.id_suppliers=suppliers.id
				LEFT JOIN places_all AS places
					ON items_grouped.id_places=places.id
				LEFT JOIN fleet
					ON places.id_fleet=fleet.id
				LEFT JOIN bsd
					ON items_grouped.id_bsd=bsd.id
			$where
			GROUP BY sn,
					items_grouped.id_places,
					items_grouped.id_owners,
					items_grouped.location,
					items_grouped.position,
					items_grouped.licence_name,
					items_grouped.licence_number,
					items_grouped.licence_prog,
					items_grouped.licence_type,
					parts.id";

	$result = $conn->do_query($sql);
	$total = $result->num_rows;
	$result->close();

	$sql.=" $sort $limit";
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
					$row['licence_name'],
					$row['pn'],
					$row['licence_type'],
					$row['licence_number'],
					$row['qty'],
					$row['sn'],
					$row['owner'],
					$row['fleet'],
					$row['place'],
					$row['location'],
					$row['position'],
					isset($row['bsd'])?$row['bsd']:""
				)
		);
	}
	echo json_encode($data);
	die();
}
elseif($op=='edit')
{
	$id_value=substr($_POST["id"],3);
	$id_field="id";

	$fields=array
	(
		"sn"=>array("value"=>"","label"=>"Serial Number"),
		"licence_name"=>array("value"=>"","label"=>"Licence Name"),
		"licence_number"=>array("value"=>"","label"=>"Licence Number"),
		"licence_prog"=>array("value"=>"","label"=>"Licence Prog"),
		"licence_type"=>array("value"=>"","label"=>"Licence Type","link"=>array("table"=>"licence_types","id"=>"id","text"=>"description")),
		"id_owners"=>array("value"=>"","label"=>"Property","link"=>array("table"=>"owners","id"=>"id","text"=>"description")),
		"location"=>array("value"=>"","label"=>"Location"),
		"position"=>array("value"=>"","label"=>"Position"),
		"to_repair"=>array("value"=>"","label"=>"to repair"),
		"id_bsd"=>array("value"=>"","label"=>"bsd","link"=>array("table"=>"bsd_array","where"=>"id_items='$id_value'","id"=>"id_bsd","text"=>"description"))
	);

	require_once("mysql.php");
	$conn=new mysqlConnection;
	$result=$conn->do_query("SELECT ifnull(places_all.id_places_types,'0') AS id_places_types FROM
		items_grouped JOIN places_all ON items_grouped.id_places=places_all.id
		WHERE items_grouped.id='$id_value'");
	$rows=$conn->result_to_array($result,false);
	if($rows[0]["id_places_types"]<2)
		unset($fields["to_repair"]);
	if($rows[0]["id_places_types"]>0)
		unset($fields["id_bsd"]);


	$result=$conn->do_query("SELECT parts.id,parts.pn,parts.description FROM
		items LEFT JOIN parts ON items.id_parts=parts.id
		WHERE items.id='$id_value'");
	$header=array();
	$header=$conn->result_to_array($result,false);
	$header=$header[0];

	$sql="SELECT COUNT(DISTINCT ig2.id) AS qty
				FROM items_grouped ig1 JOIN items_grouped ig2
					ON ig1.id_parts=ig2.id_parts
						AND ig1.id_places=ig2.id_places
						AND IFNULL(ig1.id_owners,'')=IFNULL(ig2.id_owners,'')
						AND ig1.location=ig2.location
						AND ig1.position=ig2.position
						AND ig1.licence_name=ig2.licence_name
						AND ig1.licence_number=ig2.licence_number
						AND ig1.licence_prog=ig2.licence_prog
						AND IFNULL(ig1.licence_type,'')=IFNULL(ig2.licence_type,'')
						AND ig1.sn IS NULL
						AND ig2.sn IS NULL
						AND ig1.id='$id_value'";

	$result=$conn->do_query("$sql");
	$qty=$conn->result_to_array($result,false);
	$qty=$qty[0]["qty"];
	$conn=null;


	require_once("forms.php");
	$title="Edit items";

	ob_start();
	showForm("$id_field,$id_value","items_grouped",$fields,$title);
	$form=ob_get_clean();
	$addon=array();

	require_once("bsd.php");
	$addon=get_items_in_bsd($id_value);

	echo json_encode(array("form"=>$form,"header"=>$header,"addon"=>$addon,"qty"=>$qty));
	die();
}
elseif($op=="details")
{
	$id_items=substr($_POST["id"],3);
	require_once("mysql.php");
	$conn=new mysqlConnection;
	$sql="SELECT items.id,parts.pn, items.licence_number,
				items.licence_name, parts.description,
				IFNULL(items.sn,'') AS sn, IFNULL(bsd.description,'') AS bsd, places_all.name AS place,
				licence_types.description AS licence_type,owners.description AS owner
			FROM items
				LEFT JOIN owners ON items.id_owners=owners.id
				LEFT JOIN licence_types ON items.licence_type=licence_types.id
				LEFT JOIN parts ON items.id_parts = parts.id
				LEFT JOIN items_grouped ON items.id = items_grouped.id
				LEFT JOIN places_all ON items_grouped.id_places = places_all.id
				LEFT JOIN bsd ON items_grouped.id_bsd = bsd.id
			WHERE items.id='$id_items'";
	$result=$conn->do_query($sql);
	$items=$conn->result_to_array($result,true);

	$sql="SELECT movements.date,movements.note,
					places_from.name AS place_from,
					places_to.name AS place_to,
					movements_items.location,
					movements_items.position,
					IFNULL(bsd.description,'') AS bsd,
					movements_items.new_from_supplier,
					movements_items.to_repair
			FROM items
				JOIN movements_items ON items.id=movements_items.id_items
				LEFT JOIN bsd ON movements_items.id_bsd=bsd.id
				JOIN movements ON movements.id=movements_items.id_movements
				LEFT JOIN places_all places_from ON movements.id_places_from=places_from.id
				LEFT JOIN places_all places_to ON movements.id_places_to=places_to.id
			WHERE items.id='$id_items'
			ORDER BY movements.date DESC";
	$result=$conn->do_query($sql);
	$movements=$conn->result_to_array($result,false);
	echo json_encode(array("item"=>$items,"movements"=>$movements));
	$conn=null;
	die();
}
elseif($op=="form_posted")
{
	list($id_field,$id_value)=explode(",",$_POST["id_edit"]);
	unset($_REQUEST["op"]);
	require_once("mysql.php");
	require_once("forms.php");
	if(isset($_POST["qty"]))
	{
		$qty=$_POST["qty"];
		unset($_POST["qty"]);
	}
	else
		$qty=1;

	$conn=new mysqlConnection;
	$query=buildPostQuery(true);
	$items=array();
	if($qty>1)
	{
/*		$qh=sprintf("UPDATE
						items
					INNER JOIN
					(
						SELECT i2.id
						FROM `items_grouped` AS i1
							INNER JOIN `items_grouped` AS i2
							ON i1.id='%d' AND IFNULL(i1.sn,'')=IFNULL(i2.sn,'') AND i1.location=i2.location AND i1.position=i2.position
								AND i1.id_parts=i2.id_parts AND IFNULL(i1.id_owners,'')=IFNULL(i2.id_owners,'')  AND i1.id_places=i2.id_places
						ORDER BY i2.id
						LIMIT %d
					) AS items2
					ON items.id=items2.id",$id_value,$qty);
		$query=str_replace("UPDATE items",$qh,$query);*/
		$q=sprintf("SELECT i2.id
						FROM `items_grouped` AS i1
							INNER JOIN `items_grouped` AS i2
							ON i1.id='%d' AND IFNULL(i1.sn,'')=IFNULL(i2.sn,'') AND i1.location=i2.location AND i1.position=i2.position
								AND i1.id_parts=i2.id_parts AND IFNULL(i1.id_owners,'')=IFNULL(i2.id_owners,'')  AND i1.id_places=i2.id_places
						ORDER BY i2.id
						LIMIT %d",$id_value,$qty);
		$r=$conn->do_query($q);
		$items=$conn->result_to_array($r,true);
		if(count($items)!=$qty)
		{
			$message=sprintf("matching items (%d) != requested (%d)",count($items),$qty);
			$id=0;
			$out=array
			(
				"status"=>1,
				"id"=>"$id",
				"message"=>"$message"
			);
			echo json_encode($out);
			die();
		}
		$items=array_keys($items);
		$items_list="(".implode(",",array_keys($items)).")";

		$query.=" OR `items`.id IN $items_list";
	}

	$conn->do_query($query);
	$items[]=$id_value;
	require_once("bsd.php");
	fixParentAndSons($conn,$items);
	$conn=null;

	$message="modifica effettuata";
	$id=0;
	$out=array
	(
		"status"=>0,
		"id"=>"$id",
		"message"=>"$message"
	);
	echo json_encode($out);
}
?>
