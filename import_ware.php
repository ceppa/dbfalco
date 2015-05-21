<?
	require_once("include/mysql.php");
	$conn=new mysqlConnection;
	$table="zamp";
	$id_supplier=1;
	$id_manufacturer=1;
	$id_user_creator=1;
	$id_user_updater=1;
	$conn->beginTransaction();
	$error=0;

	$q="SELECT pn,description,sn,qty,id_places,location,position,invoice,note,licence_prog,id_owners,licence_type,licence_name,licence_number,arrival_date
			FROM `$table`";
	$result=$conn->do_query($q);
	$rows=$conn->result_to_array($result,false);
	if(count($rows)==0)
		die("no data");
	foreach($rows as $row)
	{
		$pn=$row["pn"];
		$description=$row["description"];
		$sn=$row["sn"];
		$qty=$row["qty"];
		$qty=$row["id_owners"];
		$id_places=$row["id_places"];
		$location=$row["location"];
		$position=$row["position"];
		$invoice=str_replace("'","\'",$row["invoice"]);
		$note=str_replace("'","\'",$row["note"]);
		$licence_prog=str_replace("'","\'",$row["licence_prog"]);
		$licence_type=$row["licence_type"];
		$licence_name=str_replace("'","\'",$row["licence_name"]);
		$licence_number=str_replace("'","\'",$row["licence_number"]);
		$arrival_date=$row["arrival_date"];
		$arrival_date="$arrival_date 00:00:00";

		if(strlen($note)>0)
		{
			if(strlen($invoice)>0)
				$note="$note - $invoice";
		}
		else
			$note="$invoice";

		$q="select * FROM parts WHERE pn='$pn'";
		echo "$q<br>";
		$result=$conn->do_query($q);
		$rows=$conn->result_to_array($result,false);
		if(count($rows))
			$id_parts=$rows[0]["id"];
		else
		{
			$q="INSERT INTO parts(id_suppliers,id_manufacturers,pn,description,id_users_creator,id_users_updater)
				VALUES('$id_supplier','$id_manufacturer','$pn','$description','$id_user_creator','$id_user_updater')";
			echo "$q<br>";

			$conn->do_query($q);
			$id_parts=$conn->insert_id();
		}

		if(strlen($sn)&&$qty!=1)
		{
			echo ("pn: $pn, sn: $sn, qty: $qty");
			$error=1;
		}
		for($i=0;$i<$qty;$i++)
		{
			$q="INSERT INTO items(id_parts, id_owners, sn,licence_number,licence_type,licence_prog,licence_name,note,id_users_creator,id_users_updater) 
				VALUES ('$id_parts','$id_owners','$sn','$licence_number','$licence_type','$licence_prog','$licence_name','$note','$id_user_creator','$id_user_updater')";
			
			$conn->do_query($q);
			$id_items=$conn->insert_id();
			$q="SELECT id FROM movements WHERE id_places_from='$id_supplier' AND id_places_to='$id_places' AND date='$arrival_date' ORDER BY date";
			$result=$conn->do_query($q);
			$m=$conn->result_to_array($result,false);
			if(count($m))
				$id_movements=$m[0]["id"];
			else
			{
				echo "$q<br>no movements<br>";
				$q="INSERT INTO movements(date,note,id_places_from,id_places_to,id_users_creator,id_users_updater)
					VALUES('$arrival_date','import_ware','$id_supplier','$id_places','$id_user_creator','$id_user_updater')";
				echo "$q<br>";
				$conn->do_query($q);
				$id_movements=$conn->insert_id();
			}
			$q="INSERT INTO movements_items(id_movements,id_items,location,position,new_from_supplier)
				VALUES('$id_movements','$id_items','$location','$position','1')";
			$conn->do_query($q);
		}
	}
	if($error==0)
		$conn->commit();
	$conn=null;
?>
