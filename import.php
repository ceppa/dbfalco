<?
	require_once("include/mysql.php");
	$conn=new mysqlConnection;
	$table="import_KSA";
	$id_supplier=1;
	$id_manufacturer=1;
	$id_user_creator=1;
	$id_user_updater=1;
	$conn->beginTransaction();

	$q="SELECT uav_type.id FROM uav_type JOIN `$table` 
			ON `$table`.l1='1' AND `$table`.pn=uav_type.pn";
	$result = $conn->do_query($q);
	$rows=$conn->result_to_array($result,false);
	if(count($rows))
	{
		$uav_type_id=$rows[0]["id"];
		echo $uav_type_id;
	}
	else
	{
		$q="INSERT INTO uav_type(pn,description)
			SELECT pn,description FROM `$table` WHERE l1='1'";
		$conn->do_query($q);
		$uav_type_id=$conn->insert_id();
	}

	$q="SELECT ifnull(max(ordine),0) AS ordine FROM bsd";
	$result=$conn->do_query($q);
	$rows=$conn->result_to_array($result,false);
	$ordine=$rows[0]["ordine"];

	$q="SELECT l1,l2,l3,l4,pn,description,sn,mounted
			FROM `$table`";
	$result=$conn->do_query($q);
	$rows=$conn->result_to_array($result,false);
	if(count($rows)==0)
		die("no data");
	$optional=false;

	$sn=$rows[0]["sn"];
	$pn=$rows[0]["pn"];
	$q="SELECT places_all.id FROM places_all JOIN uav ON places_all.id_uav=uav.id
		WHERE uav.sn='$sn'";
	$result=$conn->do_query($q);
	$uavs=$conn->result_to_array($result,false);
	if(count($uavs))
		$id_places=$uavs[0]["id"];
	else
	{
		$q="INSERT INTO uav(sn,marche,pn,uav_type_id)
			VALUES('$sn','$sn','$pn','$uav_type_id')";
		$conn->do_query($q);
		$q="SELECT id FROM places_all WHERE id_uav='".$conn->insert_id()."'";
		$result=$conn->do_query($q);
		$uavs=$conn->result_to_array($result,false);
		if(count($uavs))
			$id_places=$uavs[0]["id"];
		else
			die("no place");
	}


	$parent_l1=0;
	$parent_l2=0;
	$parent_l3=0;
	$parent_l4=0;
	$parent_id=0;

	foreach($rows as $row)
	{
		$ordine+=10;
		$l1=$row["l1"];
		$l2=$row["l2"];
		$l3=$row["l3"];
		$l4=$row["l4"];
		$pn=$row["pn"];
		$description=$row["description"];
		$sn=$row["sn"];
		$mounted=($row["mounted"]==="0000-00-00"?"":$row["mounted"]);

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
		$q="select * FROM bsd_compatible WHERE id_parts='$id_parts'";
		echo "$q<br>";
		$result=$conn->do_query($q);
		$rows=$conn->result_to_array($result,false);
		if(count($rows))
			$id_bsd_compatible=$rows[0]["id"];
		else
		{
			$q="SELECT IFNULL(max(id),0)+1 AS id_bsd_compatible FROM bsd_compatible";
			echo "$q<br>";
			$result=$conn->do_query($q);
			$rows=$conn->result_to_array($result,false);
			if(count($rows))
				$id_bsd_compatible=$rows[0]["id_bsd_compatible"];
			
			$q="INSERT INTO bsd_compatible(id,id_parts)
				VALUES('$id_bsd_compatible','$id_parts')";
			echo "$q<br>";
			$conn->do_query($q);
		}

		if(strstr($l1,"OPT")===$l1)
		{
			$optional=1;
			$l1="";
		}
		elseif(strlen($l2))
			$optional=0;


		if(strlen($l1))
			$parent_id=0;
		elseif(strlen($l2))
			$parent_id=$parent_l1;
		elseif(strlen($l3))
			$parent_id=$parent_l2;
		elseif(strlen($l4))
			$parent_id=$parent_l3;

		$l=sprintf("%s%s%s%s",$l1,$l2,$l3,$l4);
		$just_title=((strlen($sn)==0)&&(strlen($mounted)==0)?1:0);

		$q="SELECT id FROM bsd WHERE livello='$l' AND uav_type_id='$uav_type_id'";
		$result=$conn->do_query($q);
		$bsd=$conn->result_to_array($result,false);
		if(count($bsd)>0)
			$id_bsd=$bsd[0]["id"];
		else
		{
			$q="INSERT INTO bsd(livello,optional,just_title,pn,id_parts,id_bsd_compatible,description,uav_type_id,ordine,parent)
				VALUES('$l','$optional','$just_title','$pn','$id_parts','$id_bsd_compatible','$description','$uav_type_id','$ordine','$parent_id')";
			echo "$q<br>";
			$conn->do_query($q);
			$id_bsd=$conn->insert_id();
		}
		if(strlen($l1))
			$parent_l1=$id_bsd;
		elseif(strlen($l2))
			$parent_l2=$id_bsd;
		elseif(strlen($l3))
			$parent_l3=$id_bsd;

		$sn=(trim($sn)!="N/A"?trim($sn):"");
		if((strlen($sn)==0)&&(strlen($mounted)!=0))
			$sn=$description;
		if(strlen($sn))
		{
			$q="INSERT INTO items(id_parts, sn, id_bsd) VALUES ('$id_parts','$sn','$id_bsd')";
			$conn->do_query($q);
			$id_items=$conn->insert_id();
			$mounted="$mounted 00:00:00";
			$q="SELECT id FROM movements WHERE id_places_from='$id_supplier' AND id_places_to='$id_places' AND date='$mounted' ORDER BY date";
			$result=$conn->do_query($q);
			$m=$conn->result_to_array($result,false);
			if(count($m))
				$id_movements=$m[0]["id"];
			else
			{
				$q="INSERT INTO movements(date,note,id_places_from,id_places_to,id_users_creator,id_users_updater)
					VALUES('$mounted','import','$id_supplier','$id_places','$id_user_creator','$id_user_updater')";
				$conn->do_query($q);
				$id_movements=$conn->insert_id();
			}
			$q="INSERT INTO movements_items(id_movements,id_items,new_from_supplier,id_bsd)
				VALUES('$id_movements','$id_items','1','$id_bsd')";
			$conn->do_query($q);
		}
	}
	$conn->commit();
	$conn=null;
?>
