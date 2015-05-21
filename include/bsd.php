<?

function get_bsd_array($itemId)
{
	require_once("mysql.php");
	// array con items compatibili con itemId
	$bsdArray=array(0=>"---");
	$query="SELECT bsd.id,bsd.description,items_grouped.id_bsd
		FROM items_grouped 
			JOIN bsd_compatible ON items_grouped.id_parts=bsd_compatible.id_parts
			JOIN bsd ON bsd_compatible.id=bsd.id_bsd_compatible
			JOIN places_all ON items_grouped.id_places=places_all.id
			JOIN uav ON places_all.id_uav=uav.id
		WHERE items_grouped.id='$itemId'
			AND uav.uav_type_id=bsd.uav_type_id";
	$conn=new mysqlConnection;
	$result=$conn->do_query($query);
	$rows=$conn->result_to_array($result,true);
	$conn=null;

	$id_bsd=0;
	foreach($rows as $id=>$row)
	{
		$id_bsd=$row["id_bsd"];
		$line=$row["description"];
		$bsdArray[$id]=$line;
	}
	return array("id_bsd"=>$id_bsd,"bsdArray"=>$bsdArray);
}


function get_items_in_bsd($itemId)
{
	// array con items compatibili con itemId già presenti in fotografia
	$items_in_foto=array();
	
	$query="SELECT id_items_2 as id_items,id
		FROM 
			items_in_bsd
		WHERE id_items='$itemId'";
	$conn=new mysqlConnection;
	$result=$conn->do_query($query);
	$rows=$conn->result_to_array($result,false);
	$conn=null;
	foreach($rows as $row)
		$items_in_foto[$row["id"]]=$row["id_items"];
	return $items_in_foto;
}


?>
