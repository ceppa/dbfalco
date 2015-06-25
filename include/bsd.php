<?php

function get_bsd_array($itemId)
{
	require_once("mysql.php");
	// array con items compatibili con itemId
	$bsdArray = array(0 => "---");
	$query = "SELECT bsd.id,bsd.description,items_grouped.id_bsd
		FROM items_grouped
			JOIN bsd_compatible ON items_grouped.id_parts=bsd_compatible.id_parts
			JOIN bsd ON bsd_compatible.id=bsd.id_bsd_compatible
			JOIN places_all ON items_grouped.id_places=places_all.id
			JOIN uav ON places_all.id_uav=uav.id
		WHERE items_grouped.id='$itemId'
			AND uav.uav_type_id=bsd.uav_type_id";
	$conn = new mysqlConnection;
	$result = $conn->do_query($query);
	$rows = $conn->result_to_array($result, true);
	$conn = null;

	$id_bsd = 0;
	foreach ($rows as $id => $row)
	{
		$id_bsd = $row["id_bsd"];
		$line = $row["description"];
		$bsdArray[$id] = $line;
	}
	return array("id_bsd" => $id_bsd, "bsdArray" => $bsdArray);
}

function get_items_in_bsd($itemId)
{
	// array con items compatibili con itemId già presenti in fotografia
	$items_in_foto = array();

	$query = "SELECT id_items_2 as id_items,id
		FROM
			items_in_bsd
		WHERE id_items='$itemId'";
	$conn = new mysqlConnection;
	$result = $conn->do_query($query);
	$rows = $conn->result_to_array($result, false);
	$conn = null;
	foreach ($rows as $row)
		$items_in_foto[$row["id"]] = $row["id_items"];
	return $items_in_foto;
}

function fixParentAndSons($conn, $items = 0)
{
	if ($items == 0)
		$condition = ">0";
	else
	{
		if (is_array($items) && (count($items) > 0))
			$condition = " IN(" . implode(",", $items) . ")";
		else
			$condition = "=0";
	}
	// null parent_id where item and parent in different places
	$sql = "UPDATE items
			JOIN items_grouped items_son
	        	ON items.parent_id" . $condition . "AND items.id=items_son.id
			JOIN items_grouped
				ON items.parent_id=items_grouped.id
			SET items.parent_id=NULL
			WHERE items_son.id_places!=items_grouped.id_places";

	$conn->do_query($sql);

	// null parent_id where item and parent in different places
	$sql = "UPDATE items
			JOIN items_grouped
				ON items.id$condition AND items.id=items_grouped.id
			JOIN items_grouped items_parent
				ON items_grouped.parent_id=items_parent.id
	        SET items.parent_id=NULL
			WHERE items_parent.id_places!=items_grouped.id_places";
	$conn->do_query($sql);

	// update parent according to bsd
	$sql = "UPDATE items
		JOIN items_grouped
			ON items.id" . $condition . " AND items.id=items_grouped.id
		JOIN bsd
			ON items_grouped.id_bsd=bsd.id
		JOIN bsd bsdp
			ON bsd.parent=bsdp.id
		JOIN items_grouped igp
			ON items_grouped.id_places=igp.id_places AND igp.id_bsd=bsdp.id
		SET items.parent_id=igp.id";
	$conn->do_query($sql);

	// update sons according to bsd
	$sql = "UPDATE items_grouped igp
		JOIN bsd bsdp
			ON igp.id" . $condition . " AND igp.id_bsd=bsdp.id
		JOIN bsd
			ON bsd.parent=bsdp.id
		JOIN items_grouped
			ON bsd.id=items_grouped.id_bsd AND items_grouped.id_places=igp.id_places
		JOIN items
			ON items_grouped.id=items.id
		SET items.parent_id=igp.id";
	$conn->do_query($sql);


	// nullify parent to sons whose parent is moved out bsd
	$sql = "UPDATE items
		JOIN items_grouped
			ON items.id=items_grouped.id
		LEFT JOIN bsd
			ON items_grouped.id_bsd=bsd.id
		JOIN bsd bsdp
			ON bsd.parent=bsdp.id
		LEFT JOIN items_grouped igp
			ON items_grouped.id_places=igp.id_places AND igp.id_bsd=bsdp.id
		SET items.parent_id=NULL
		WHERE items.parent_id" . $condition . " and igp.id IS NULL";
	$conn->do_query($sql);
}

?>
