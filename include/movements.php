<?
require_once("const.php");
require_once("util.php");
require_once("../config.php");

$op=$_REQUEST["op"];


if($op=='list')
{
	$id_fleet=$_SESSION["id_fleet"];
	$where = "WHERE (places_from.id_fleet IN($id_fleet) OR places_to.id_fleet IN ($id_fleet))";
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

	$sql="SELECT movements.id,
				movements.date,
				movements.note,
				places_from.name AS place_from,
				places_to.name AS place_to,
				GROUP_CONCAT(DISTINCT CONCAT(parts.pn,'¹',parts.description,'¹',IFNULL(items.sn,''),'¹',qt.qty)
					ORDER BY parts.pn,items.sn SEPARATOR '§') as pn,
				GROUP_CONCAT(DISTINCT CONCAT(documents.id,'§',documents.description)
					ORDER BY documents.description SEPARATOR '§') AS documents
			FROM movements
			LEFT JOIN movements_items
				ON movements.id=movements_items.id_movements
			LEFT JOIN items ON movements_items.id_items=items.id
			LEFT JOIN parts ON items.id_parts=parts.id
			JOIN
			(
				SELECT movements_items.id_movements,items.id_parts,IFNULL(items.sn,'') AS sn,count(IFNULL(items.sn,'')) AS qty
				FROM movements_items JOIN items ON movements_items.id_items=items.id
				JOIN parts ON items.id_parts=parts.id
				GROUP BY movements_items.id_movements,parts.id,IFNULL(items.sn,'')
				ORDER BY parts.pn
			) qt ON movements.id=qt.id_movements AND items.id_parts=qt.id_parts AND IFNULL(items.sn,'')=qt.sn
			LEFT JOIN places_all AS places_from
				ON movements.id_places_from=places_from.id
			LEFT JOIN places_all AS places_to
				ON movements.id_places_to=places_to.id
			LEFT JOIN movements_documents
				ON movements.id=movements_documents.id_movements
			LEFT JOIN documents ON movements_documents.id_documents=documents.id
		$where
		GROUP BY movements.id";

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
		$exploded=explode("§",$row["documents"]);
		$documents="";
		for($i=0;$i<count($exploded);$i+=2)
		{
			if(strlen($exploded[$i])&&strlen($exploded[$i+1]))
			{
				$documents.="<a href='#' ";
				$documents.="onclick='showDoc(".$exploded[$i].")'>";
				$documents.=$exploded[$i+1];
				$documents.="</a><br>";
			}
		}
		$explodedpa=explode("§",$row["pn"]);
		$dots=false;
		if(count($explodedpa)>5)
		{
			array_splice($explodedpa, 4);
			$dots=true;
		}
		$explodedp=array();
		$explodedd=array();
		$explodeds=array();
		$explodedq=array();
		foreach($explodedpa as $exp)
		{
			$ee=explode("¹",$exp);
			$explodedp[]=$ee[0];
			$explodedd[]=$ee[1];
			$explodeds[]=$ee[2];
			$explodedq[]=$ee[3];
		}
		if($dots)
		{
			$explodedp[]="...";
			$explodedd[]="...";
			$explodeds[]="...";
			$explodedq[]="...";
		}
		$pn=implode("<br>",$explodedp);
		$sn=implode("<br>",$explodeds);
		$description=implode("<br>",$explodedd);
		$qty=implode("<br>",$explodedq);
		$note=str_replace("\n","<br>",$row['note']);
		$data['rows'][] = array
		(
			'id' => $id,
			'cell' => array
				(
					$row['date'],
					$row['place_from'],
					$row['place_to'],
					$pn,
					$description,
					$sn,
					$qty,
					$note,
					$documents
				)
		);
	}
	echo json_encode($data);
	die();
}
elseif($op=='edit')
{
	$fields=array(
		"date"=>array("value"=>"","label"=>"Date"),
		"note"=>array("value"=>"","label"=>"Note")
		);

	$id_value=substr($_POST["id"],3);
	$id_field="id";

	ob_start();
	require_once("forms.php");
	$title="Edit movement";
	showForm("$id_field,$id_value","movements",$fields,$title);
	$form=ob_get_clean();
	$details=getMovementsDetails($id_value);
	$documents=getMovementsDocuments($id_value);
	echo json_encode(array("form"=>$form,"details"=>$details,"documents"=>$documents));
	die();
}
elseif($op=='add')
{
	$id_fleet=$_SESSION["id_fleet"];
	$where = "(id_fleet IS NULL OR id_fleet IN($id_fleet))";
	if(isset($_SESSION["livello"])&&($_SESSION["livello"]==3))
		$where="1";
	$fields=array(
		"date"=>array("value"=>"","label"=>"Date"),
		"id_places_from"=>array("value"=>"","label"=>"From"
			,"link"=>array("table"=>"places_all"
			,"id"=>"concat(id,'_',ifnull(id_places_types,'0'))","text"=>"name"
			,"where"=>"enabled=1 AND $where")),
		"id_places_to"=>array("value"=>"","label"=>"To"
			,"link"=>array("table"=>"places_all"
			,"id"=>"concat(id,'_',ifnull(id_places_types,'0'))","text"=>"name"
			,"where"=>"enabled=1 AND $where")),
		"note"=>array("value"=>"","label"=>"Note"),
		);

	require_once("forms.php");
	$title="Insert new movement";
	ob_start();
	showForm("","movements",$fields,$title);
	$form=ob_get_clean();



	$addon=array();
	$id_items=(isset($_POST["id_items"])?$_POST["id_items"]:0);
	if($id_items>0)
	{
		require_once("mysql.php");
		$conn=new mysqlConnection;
		$sql="SELECT CONCAT(ig.id_places,'_',IFNULL(pa.id_places_types,'0')) AS id_places,
				ig.id_parts,p.description,p.pn
			FROM items_grouped ig JOIN parts p ON ig.id_parts=p.id
				JOIN places_all pa ON ig.id_places=pa.id
			WHERE ig.id='$id_items'";
		$result=$conn->do_query($sql);
		$rows=$conn->result_to_array($result,true);
		if(count($rows)==1)
			$addon=array("id_parts"=>$rows[0]["id_parts"],
					"description"=>$rows[0]["description"],
					"pn"=>$rows[0]["pn"],
					"id_places"=>$rows[0]["id_places"]);
	}

	echo json_encode(array("form"=>$form,"addon"=>$addon));
	die();
}
elseif($op=='newPart')
{
	require_once("mysql.php");

	$conn=new mysqlConnection;

	$sql="SELECT id,description FROM categories ORDER BY `description`";
	$result=$conn->do_query($sql);
	$rows=$conn->result_to_array($result,true);
	$categories=array();
	foreach($rows as $id=>$row)
		$categories[$id]=$row["description"];

	$sql="SELECT id,name,id_places_types FROM places WHERE id_places_types>1 AND enabled=1 ORDER BY `name`";
	$result=$conn->do_query($sql);
	$rows=$conn->result_to_array($result,true);
	$suppliers=array();
	$manufacturers=array();
	foreach($rows as $id=>$row)
	{
		if($row["id_places_types"]<4)
			$suppliers[$id]=$row["name"];
		if($row["id_places_types"]>2)
			$manufacturers[$id]=$row["name"];
	}

	$sql="SELECT id,`long` FROM measure_unit ORDER BY `long`";
	$result=$conn->do_query($sql);
	$rows=$conn->result_to_array($result,true);
	$measure_unit=array();
	foreach($rows as $id=>$row)
		$measure_unit[$id]=$row["long"];

	$out=array("categories"=>$categories,
		"suppliers"=>$suppliers,
		"manufacturers"=>$manufacturers,
		"measure_unit"=>$measure_unit);

	$conn=null;

	echo json_encode($out);
	die();
}
elseif($op=='fillSnFromPn')
{
	require_once("mysql.php");
	$id_parts=$_POST["id_parts"];
	$id_places_from=$_POST["id_places_from"];
	$id_places_to=$_POST["id_places_to"];

	$conn=new mysqlConnection;

	$sql="SELECT items_grouped.id,
				IFNULL(items_grouped.sn,'') AS sn,
				count(items_grouped.id) AS qty,
				items_grouped.location,
				items_grouped.position,
				IFNULL(owners.description,'') AS owner,
				items_grouped.licence_name,
				items_grouped.licence_number,
				items_grouped.licence_prog,
				IFNULL(licence_types.description,'')  AS licence_type
			FROM items_grouped
				LEFT JOIN owners ON items_grouped.id_owners=owners.id
				LEFT JOIN licence_types ON items_grouped.licence_type=licence_types.id
			WHERE items_grouped.id_parts='$id_parts'
			AND id_places='$id_places_from'
		GROUP BY IFNULL(items_grouped.sn,''),items_grouped.id_owners,items_grouped.location,items_grouped.position,
			items_grouped.licence_name,items_grouped.licence_number,items_grouped.licence_prog,items_grouped.licence_type";

	$result=$conn->do_query($sql);
	$rows=$conn->result_to_array($result,false);

	$sql="SELECT id,description FROM owners";
	$result=$conn->do_query($sql);
	$owners=$conn->result_to_array($result,false);

	$sql="SELECT id,description FROM licence_types";
	$result=$conn->do_query($sql);
	$licence_types=$conn->result_to_array($result,false);


	$conn=null;

	$s=buildBsdCombo($id_parts,$id_places_to);
	echo json_encode(array("rows"=>$rows,"bsdCombo"=>$s,"owners"=>$owners,"licence_types"=>$licence_types));
	die();
}
elseif($op=='do_edit')
{
	require_once("mysql.php");
	$id_edit=explode(",",$_POST["id_edit"]);
	$id_movements=$id_edit[1];

	$conn=new mysqlConnection;
	$conn->do_query("START TRANSACTION");

	$uploadErrorString="";
	$id_documents=(isset($_POST["id_documents"])?implode(",",$_POST["id_documents"]):"''");

	$sql="DELETE FROM movements_documents
		WHERE id_movements='$id_movements'
			AND id_documents NOT IN ($id_documents)";
	$conn->do_query($sql);

	$sql="DELETE d FROM documents d
			LEFT JOIN movements_documents
			ON d.id=movements_documents.id_documents
			WHERE movements_documents.id_documents IS NULL";

	$conn->do_query($sql);

	$uploads=array();
	foreach($_POST as $k=>$v)
	{
		if(substr($k,0,8)=="docdesc_")
		{
			if(strlen(trim($v)))
			{
				$n=substr($k,8);
				$desc=str_replace("§","_",$v);
				$filename=$_FILES["docfile_$n"]["name"];
				$tmp_name=$_FILES["docfile_$n"]["tmp_name"];
				$type=$_FILES["docfile_$n"]["type"];
				$size=$_FILES["docfile_$n"]["size"];

				if((int)$_FILES["docfile_$n"]["error"]==0)
				{
					$uploads[]=array
						(
							"desc"=>$desc,
							"filename"=>$filename,
							"tmp_name"=>$tmp_name,
							"type"=>$type,
							"size"=>$size
						);
				}
				else
					$uploadErrorString.="file $filename is too large to be uploaded\n";
			}
		}

	}
	handleUploads($conn,$id_movements,$uploads);

	$date=$_POST["date"];
	$note=str_replace("'","\'",$_POST["note"]);

	$query="UPDATE movements SET `date`='$date', `note`='$note'
			WHERE `id`='$id_movements'";
	$conn->do_query($query);

	$conn->do_query("COMMIT");
	$conn=null;

	$message=(strlen($uploadErrorString)?$uploadErrorString:"movement modified");
	$out=0;
	echo json_encode(array("message"=>$message,"out"=>$out));
	die();
}
elseif($op=='check_sn')
{
	$out="";
	$where="";
	foreach($_POST as $k=>$sn)
	{
		if(substr($k,0,5)=="snni_")
		{
			$exp=explode("_",$k);
			$id_parts=$exp[1];
			$where.="OR (id_parts='$id_parts' AND sn='$sn') ";
		}
	}
	if(strlen($where))
	{
		require_once("mysql.php");
		$where=ltrim($where,"OR");
		$q="SELECT sn,id_parts FROM items WHERE $where";
		$conn=new mysqlConnection;
		$result=$conn->do_query("$q");
		$rows=$conn->result_to_array($result);
		foreach($rows as $row)
		{
			$name=sprintf("snni_%s_",$row["id_parts"]);
			foreach($_POST as $k=>$sn)
				if((strstr($k,$name)==$k)&&($sn==$row["sn"]))
					$out.="$k,";
		}

	}
	echo rtrim($out,",");
	die();
}
elseif($op=='do_add')
{
	require_once("../config.php");
//	parse_str($_POST["postdata"],$post);
	$post=$_POST;
	$id_places_from=explode("_",$post["id_places_from"]);
	$id_places_from=$id_places_from[0];
	$id_places_to=explode("_",$post["id_places_to"]);
	$id_places_to=$id_places_to[0];
	$date=$post["date"];
	$note=$post["note"];

	$affected_items=array();


	$movements=array();
	$ni=array();

	$uploadErrorString="";
	$uploads=array();
	$docs=array();
	foreach($post as $k=>$v)
	{
		if(substr($k,0,4)=="chk_")
		{
			list($foo,$id_parts,$id_items)=explode("_",$k);

			$qty=$post[sprintf("qty_%d_%d",$id_parts,$id_items)];
			$loc=$post[sprintf("loc_%d_%d",$id_parts,$id_items)];
			$pos=$post[sprintf("pos_%d_%d",$id_parts,$id_items)];
			$bsdfield=sprintf("bsd_%d_%d",$id_parts,$id_items);
			$bsd=(isset($post[$bsdfield])?(int)$post[$bsdfield]:0);
			$movements[]=array(
				"id_parts"=>$id_parts,
				"id_items"=>$id_items,
				"qty"=>$qty,
				"loc"=>$loc,
				"pos"=>$pos,
				"bsd"=>$bsd,
				"nfs"=>0);
		}
		if(substr($k,0,6)=="chkni_")
		{
			list($foo,$id_parts,$i)=explode("_",$k);

			$qty=$post[sprintf("qtyni_%d_%d",$id_parts,$i)];
			$loc=$post[sprintf("locni_%d_%d",$id_parts,$i)];
			$pos=$post[sprintf("posni_%d_%d",$id_parts,$i)];
			$sn=$post[sprintf("snni_%d_%d",$id_parts,$i)];
			$lty=$post[sprintf("ltyni_%d_%d",$id_parts,$i)];
			$lnu=$post[sprintf("lnuni_%d_%d",$id_parts,$i)];
			$lna=$post[sprintf("lnani_%d_%d",$id_parts,$i)];
			$lpr=$post[sprintf("lprni_%d_%d",$id_parts,$i)];
			$own=$post[sprintf("ownni_%d_%d",$id_parts,$i)];
			$bsd=(int)(isset($post[sprintf("bsdni_%d_%d",$id_parts,$i)])?$post[sprintf("bsdni_%d_%d",$id_parts,$i)]:0);
			$ni[]=array(
				"id_parts"=>$id_parts,
				"qty"=>$qty,
				"sn"=>$sn,
				"lty"=>$lty,
				"lnu"=>$lnu,
				"lna"=>$lna,
				"lpr"=>$lpr,
				"own"=>$own,
				"bsd"=>$bsd,
				"loc"=>$loc,
				"pos"=>$pos);
		}
		if(substr($k,0,8)=="docdesc_")
		{
			if(strlen(trim($v)))
			{
				$n=substr($k,8);
				$desc=str_replace("§","_",$v);
				$filename=$_FILES["docfile_$n"]["name"];
				$tmp_name=$_FILES["docfile_$n"]["tmp_name"];
				$type=$_FILES["docfile_$n"]["type"];
				$size=$_FILES["docfile_$n"]["size"];

				if((int)$_FILES["docfile_$n"]["error"]==0)
				{
					$uploads[]=array
						(
							"desc"=>$desc,
							"filename"=>$filename,
							"tmp_name"=>$tmp_name,
							"type"=>$type,
							"size"=>$size
						);
				}
				else
					$uploadErrorString.="file $filename is too large to be uploaded\n";
			}
		}
		elseif((substr($k,0,9)=="docex_id")&&(strlen($v)))
			$docs[]=$v;
	}

	require_once("mysql.php");

	if(count($movements)||count($ni))
	{
		$conn=new mysqlConnection;
		$conn->do_query("START TRANSACTION");

// insert movement

		$query="INSERT INTO movements
		(
			date,
			id_places_from,
			id_places_to,
			note,
			id_users_creator,
			id_users_updater
		)
		VALUES
		(
			'$date',
			'$id_places_from',
			'$id_places_to',
			'$note',
			'".$_SESSION["id"]."',
			'".$_SESSION["id"]."'
		)";
		$conn->do_query($query);
		$id_movements=$conn->insert_id();


// insert new items and related movements
		foreach($ni as $nii)
		{
			$id_parts=$nii["id_parts"];
			$qty=$nii["qty"];
			$bsd=(int)$nii["bsd"];
			if($bsd>0)
				$qty=1;
			else
				$bsd="NULL";

			$loc=str_replace("'","\'",$nii["loc"]);
			$pos=str_replace("'","\'",$nii["pos"]);
			$sn=str_replace("'","\'",trim($nii["sn"]));
			if(strlen($sn)>0)
			{
				$qty=1;
				$sn="'$sn'";
			}
			else
				$sn="null";

			$lty=(int)$nii["lty"];
			$licence_type=($lty>0?$lty:"null");
			$own=(int)$nii["own"];
			$owner=($own>0?$own:"null");
			$licence_number=str_replace("'","\'",trim($nii["lnu"]));
			$licence_name=str_replace("'","\'",trim($nii["lna"]));
			$licence_prog=str_replace("'","\'",trim($nii["lpr"]));

			for($i=0;$i<$qty;$i++)
			{
				$query="INSERT INTO items
					(
						id_parts,
						sn,
						licence_type,
						licence_number,
						licence_name,
						licence_prog,
						id_owners,
						id_users_creator,
						id_users_updater
					)
					VALUES
					(
						'$id_parts',
						$sn,
						$licence_type,
						'$licence_number',
						'$licence_name',
						'$licence_prog',
						$owner,
						'".$_SESSION["id"]."',
						'".$_SESSION["id"]."'
					)";

				$conn->do_query($query);
				$id_items=$conn->insert_id();
				$affected_items[]=$id_items;

				$query="INSERT INTO movements_items(id_movements,id_items,new_from_supplier,location,position,id_bsd)
							VALUES ('$id_movements', '$id_items',1,'$loc','$pos',$bsd)";
				$conn->do_query($query);

			}
		}
// insert other items
		foreach($movements as $movement)
		{
			$id_parts=$movement["id_parts"];
			$id_items=$movement["id_items"];
			$qty=$movement["qty"];
			$bsd=($movement["bsd"]>0?$movement["bsd"]:"NULL");
			$loc=str_replace("'","\'",$movement["loc"]);
			$pos=str_replace("'","\'",$movement["pos"]);

			$affected_items[]=$items;
			$query="INSERT INTO movements_items(id_movements,id_items,location,position,id_bsd)
				SELECT '$id_movements', items.id,'$loc','$pos',$bsd FROM
				items
					INNER JOIN
					(
						SELECT i2.id
						FROM `items_grouped` AS i1
							INNER JOIN `items_grouped` AS i2
							ON i1.id='$id_items' AND IFNULL(i1.sn,'')=IFNULL(i2.sn,'') AND i1.location=i2.location AND i1.position=i2.position
								AND i1.id_parts=i2.id_parts AND IFNULL(i1.id_owners,'')=IFNULL(i2.id_owners,'')
						WHERE i1.id_parts='$id_parts'
						AND i1.id_places='$id_places_from'
						ORDER BY i2.id
						LIMIT $qty
					) AS items2
					ON items.id=items2.id";

			$conn->do_query($query);
			if($conn->affected_rows()!=$qty)
				die($query);
		}
// fix parent and sons
		fixParentAndSons($conn,$affected_items);
// handle uploads
		handleUploads($conn,$id_movements,$uploads);

		$conn->do_query("COMMIT");
		$conn=null;
		echo "0";
		die();
	}
	echo "1";
	die();
}
elseif($op=='details')
{
	$id_movements=substr($_POST["id"],3);
	require_once("mysql.php");
	$conn=new mysqlConnection;

	$sql="SELECT movements.id,movements.date,movements.note,
					places_from.name AS place_from,
					places_to.name AS place_to
			FROM movements
				LEFT JOIN places_all places_from ON movements.id_places_from=places_from.id
				LEFT JOIN places_all places_to ON movements.id_places_to=places_to.id
			WHERE movements.id='$id_movements'";
	$result=$conn->do_query($sql);
	$header=$conn->result_to_array($result,true);
	$details=getMovementsDetails($id_movements);
	echo json_encode(array("header"=>$header,"details"=>$details));
	$conn=null;
	die();
}
elseif($op=='build_bsd_combos')
{
	$id_places_to=$_POST["id_places_to"];
	$id_parts_list=$_POST["id_parts_list"];
	$id_parts_exploded=explode(",",$id_parts_list);

	$bsdCombos=array();
	foreach($id_parts_exploded as $id_parts)
		$bsdCombos[$id_parts]=buildBsdCombo($id_parts,$id_places_to);
	echo (json_encode($bsdCombos));
	die();
}
elseif(($op=="showDoc") && (isset($_GET["id_documents"])))
{
	$id=$_GET["id_documents"];

	require_once("mysql.php");
	$conn=new mysqlConnection;

	$sql="SELECT filename, type, size, content FROM documents WHERE id=$id";
	$result=$conn->do_query($sql);
	$rows=$conn->result_to_array($result,false);

	if(count($rows)==1)
	{
		$name=$rows[0]["filename"];
		$type=$rows[0]["type"];
		$size=$rows[0]["size"];
		$content=$rows[0]["content"];
		header("Content-type: $type");
		header("Content-Disposition: attachment; filename=\"$name\"");
		echo $content;
	}

	$conn=null;
}

function buildBsdCombo($id_parts,$id_places_to)
{
	require_once("mysql.php");
	$id_places_to_exploded=explode("_",$id_places_to);
	$do_bsd=((count($id_places_to_exploded)>1)&&($id_places_to_exploded[1]=="0"));

	$s="";
	if($do_bsd)
	{
		$id_places_to=$id_places_to_exploded[0];
		$conn=new mysqlConnection;

		$sql="SELECT bsd.id,bsd.description
			FROM places_all JOIN uav
				ON places_all.id_uav=uav.id AND places_all.id='$id_places_to'
			JOIN bsd ON uav.uav_type_id=bsd.uav_type_id
			JOIN bsd_compatible ON bsd.id_bsd_compatible=bsd_compatible.id
			WHERE bsd_compatible.id_parts='$id_parts'
			GROUP BY bsd.id";
		$result=$conn->do_query($sql);
		$s=$conn->result_to_array($result,true);
		foreach($s as $k=>$v)
			$s[$k]=$v["description"];
		$do_bsd=(count($s)>0);
		if($do_bsd)
		{
			$sql="SELECT t.bsd,t.id_places_to
						FROM
						(
							SELECT IFNULL(movements_items.id_bsd,0) AS bsd,
									movements.id_places_to AS id_places_to,
									movements_items.id_items
								FROM items
									JOIN movements_items
										ON items.id = movements_items.id_items
											AND items.id_parts='$id_parts'
									LEFT JOIN bsd_compatible
										ON items.id_parts = bsd_compatible.id_parts
									LEFT JOIN movements
										ON movements.id = movements_items.id_movements
									LEFT JOIN places_all
										ON movements.id_places_to=places_all.id
									LEFT JOIN uav
										ON places_all.id_uav=uav.id
									LEFT JOIN bsd
										ON bsd_compatible.id = bsd.id_bsd_compatible
										AND bsd.uav_type_id=uav.uav_type_id
								ORDER BY movements.date DESC
						) t
						GROUP BY t.id_items
						HAVING t.bsd>0 AND t.id_places_to='$id_places_to'";
			$result=$conn->do_query($sql);
			$t=$conn->result_to_array($result,true);
			foreach($t as $u)
				unset($s[$u["bsd"]]);
		}
		else
			$s="";
		$conn=null;
	}
	return $s;
}


function getMovementsDetails($id_movements)
{
	require_once("mysql.php");
	$conn=new mysqlConnection;
	$sql="SELECT parts.pn, items.licence_number,
				items.licence_name,items.licence_number,items.licence_prog,
					IFNULL(licence_types.description,'') AS licence_type,parts.description,
				IFNULL(items.sn,'') AS sn, IFNULL(bsd.description,'') AS bsd,
					movements_items.location,movements_items.position,
					IFNULL(owners.description,'') AS owner,
				count(items.id) AS qty
			FROM movements
				LEFT JOIN movements_items ON movements.id=movements_items.id_movements
				LEFT JOIN items ON items.id = movements_items.id_items
				LEFT JOIN owners ON items.id_owners = owners.id
				LEFT JOIN licence_types ON items.licence_type = licence_types.id
				LEFT JOIN parts ON items.id_parts = parts.id
				LEFT JOIN bsd ON movements_items.id_bsd = bsd.id
			WHERE movements.id='$id_movements'
			GROUP BY parts.pn,items.sn,items.licence_name,items.licence_number,
				items.licence_prog,items.licence_type,movements_items.location,
				movements_items.position,movements_items.id_bsd,items.id_owners
			ORDER BY parts.pn,items.sn";
	$result=$conn->do_query($sql);
	$details=$conn->result_to_array($result,false);
	$conn=null;
	return $details;
}

function handleUploads($conn,$id_movements,$uploads)
{
	$docs=array();
	foreach($uploads as $k=>$v)
	{
		$checksum=hash_file('crc32', $v["tmp_name"]);
		$fp=fopen($v["tmp_name"],'r');
		$content = fread($fp, filesize($v["tmp_name"]));
		$content = addslashes($content);
		fclose($fp);
		$filename=addslashes($v["filename"]);
		$desc=addslashes($v["desc"]);
		$size=$v["size"];
		$type=$v["type"];

		$query="SELECT id FROM documents
				WHERE checksum='$checksum'";
		$result=$conn->do_query($query);
		$rows=$conn->result_to_array($result,false);
		if(count($rows)==1)
			$id_documents=$rows[0]["id"];
		else
		{
			$query = "INSERT INTO documents
					(
						description,
						filename,
						size,
						type,
						content,
						checksum
					)
					VALUES
					(
						'$desc',
						'$filename',
						'$size',
						'$type',
						'$content',
						'$checksum'
					)";
			$conn->do_query($query);
			$id_documents=$conn->insert_id();
		}
		$docs[]=$id_documents;
	}
	$docs=array_unique($docs);
	foreach($docs as $id_documents)
	{
		$query = "INSERT INTO movements_documents
					(
						id_movements,
						id_documents
					)
					VALUES
					(
						'$id_movements',
						'$id_documents'
					)";
		$conn->do_query($query);
	}
}

function getMovementsDocuments($id_movements)
{
	require_once("mysql.php");
	$conn=new mysqlConnection;
	$sql="SELECT documents.id AS id_documents, documents.filename,
					documents.description
			FROM movements_documents
				LEFT JOIN documents
					ON movements_documents.id_documents=documents.id
			WHERE movements_documents.id_movements='$id_movements'
			ORDER BY description,filename";
	$result=$conn->do_query($sql);
	$documents=$conn->result_to_array($result,false);
	$conn=null;
	return $documents;
}


function fixParentAndSons($conn,$items)
{
/*	if($items==="*")
		$where="WHERE 1=1";
	else
	{
		if(is_array($items)&&count($items))
			$where="WHERE items_grouped.id IN(".implode(",",$items).")";
		else
			$where="WHERE items_grouped.id=0";
	}
	$q="SELECT items_grouped.id,items_grouped.id_places,
				items_parent.id_places AS id_places_parent,
				items_sons.id_places AS id_places_sons
			FROM
				items_grouped LEFT JOIN items_grouped items_parent
					ON items_grouped.parent_id=items_parent.id
				LEFT JOIN items_grouped items_sons
					ON items_grouped.id=items_sons.parent_id
				WHERE (items_parent.id_places is not null and items_parent.id_places!=items_grouped.id_places)
					OR (items_sons.id_places is not null and items_sons.id_places!=items_grouped.id_places)"
*/
}

?>
