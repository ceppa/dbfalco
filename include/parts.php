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
		$sortname="parts.description";
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

	$sql="SELECT parts.id, 
					parts.pn, 
					parts.description AS description,
					manufacturers.name AS manufacturer,
					suppliers.name AS supplier,
					GROUP_CONCAT(DISTINCT CONCAT(parts_files_data.id,'§',parts_files_data.description) 
						ORDER BY parts_files_data.description SEPARATOR '§') AS documents 
				FROM parts
				LEFT JOIN places AS manufacturers 
					ON parts.id_manufacturers=manufacturers.id
				LEFT JOIN places AS suppliers 
					ON parts.id_suppliers=suppliers.id
				LEFT JOIN parts_files
					ON parts.id=parts_files.id_parts
				LEFT JOIN parts_files_data
					ON parts_files.id_files=parts_files_data.id
			$where
			GROUP BY parts.id";

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
				$documents.="onclick='showPartDoc(".$exploded[$i].")'>";
				$documents.=$exploded[$i+1];
				$documents.="</a><br>";
			}
		}

		$data['rows'][] = array
		(
			'id' => $id,
			'cell' => array
				(
					$row['pn'],
					$row['description'],
					$row['supplier'],
					$row['manufacturer'],
					$documents
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
		"pn"=>array("value"=>"","label"=>"Part Number"),
		"description"=>array("value"=>"","label"=>"Description"),
		"id_suppliers"=>array("value"=>"","label"=>"Supplier","link"=>array("table"=>"places","id"=>"id","text"=>"name","where"=>"(id_fleet IS NULL AND id_places_types IN (2,3))")),
		"id_manufacturers"=>array("value"=>"","label"=>"Manufacturer","link"=>array("table"=>"places","id"=>"id","text"=>"name","where"=>"(id_fleet IS NULL AND id_places_types in(3,4))"))
	);
/*
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
	$conn=null;


	require_once("forms.php");
	$title="Edit items";

	ob_start();
	showForm("$id_field,$id_value","items_grouped",$fields,$title);
	$form=ob_get_clean();
	$addon=array();

	require_once("bsd.php");
	$addon=get_items_in_bsd($id_value);
	
	echo json_encode(array("form"=>$form,"header"=>$header,"addon"=>$addon));
*/
	require_once("forms.php");
	$title="Edit part";

	ob_start();
	showForm("$id_field,$id_value","parts",$fields,$title);
	$form=ob_get_clean();
	$documents=getPartDocuments($id_value);
	echo json_encode(array("form"=>$form,"documents"=>$documents));
	die();
}
elseif($op=="details")
{
	$id_parts=substr($_POST["id"],3);
	require_once("mysql.php");
	$conn=new mysqlConnection;
	$sql="SELECT parts.id,parts.pn, parts.description,
				suppliers.name AS supplier,
				manufacturers.name AS manufacturer
			FROM parts
				LEFT JOIN places AS suppliers ON parts.id_suppliers = suppliers.id
				LEFT JOIN places AS manufacturers ON parts.id_manufacturers = manufacturers.id
			WHERE parts.id='$id_parts'";
	$result=$conn->do_query($sql);
	$parts=$conn->result_to_array($result,true);

	$documents=getPartDocuments($id_parts);
	echo json_encode(array("part"=>$parts,"documents"=>$documents));
	$conn=null;
	die();
}
elseif($op=="do_edit")
{
	require_once("mysql.php");
	$id_edit=explode(",",$_POST["id_edit"]);
	$id_parts=$id_edit[1];

	$conn=new mysqlConnection;
	$conn->do_query("START TRANSACTION");

	$uploadErrorString="";
	$id_documents=(isset($_POST["id_documents"])?implode(",",$_POST["id_documents"]):"''");

	$sql="DELETE FROM parts_files
		WHERE id_parts='$id_parts' 
			AND id_files NOT IN ($id_documents)";
	$conn->do_query($sql);

	$sql="DELETE d FROM parts_files_data d 
			LEFT JOIN parts_files 
			ON d.id=parts_files.id_files 
			WHERE parts_files.id_files IS NULL";

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
	handlePartsUploads($conn,$id_parts,$uploads);

	$pn=str_replace("'","\'",$_POST["pn"]);
	$description=str_replace("'","\'",$_POST["description"]);
	$id_suppliers=$_POST["id_suppliers"];
	$id_manufacturers=$_POST["id_manufacturers"];

	$query="UPDATE parts SET `pn`='$pn', `description`='$description',
			id_suppliers='$id_suppliers', id_manufacturers='$id_manufacturers'
			WHERE `id`='$id_parts'";
	$conn->do_query($query);

	$conn->do_query("COMMIT");
	$conn=null;
	$out=(strlen($uploadErrorString)==0?0:1);
	$message=($out?$uploadErrorString:"part modified");
	echo json_encode(array("message"=>$message,"out"=>$out));
	die();
}
elseif(($op=="showDoc") && (isset($_GET["id_files"])))
{
	$id=$_GET["id_files"];

	require_once("mysql.php");
	$conn=new mysqlConnection;

	$sql="SELECT filename, type, size, content FROM parts_files_data WHERE id=$id";
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


function handlePartsUploads($conn,$id_parts,$uploads)
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

		$query="SELECT id FROM parts_files_data 
				WHERE checksum='$checksum'";
		$result=$conn->do_query($query);
		$rows=$conn->result_to_array($result,false);
		if(count($rows)==1)
			$id_files=$rows[0]["id"];
		else
		{
			$query = "INSERT INTO parts_files_data
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
			$id_files=$conn->insert_id();
		}
		$docs[]=$id_files;
	}
	$docs=array_unique($docs);
	foreach($docs as $id_files)
	{
		$query = "INSERT INTO parts_files
					(
						id_parts,
						id_files
					)
					VALUES
					(
						'$id_parts',
						'$id_files'
					)";
		$conn->do_query($query);
	}
}

function getPartDocuments($id_parts)
{
	require_once("mysql.php");
	$conn=new mysqlConnection;
	$sql="SELECT parts_files_data.id AS id_documents, parts_files_data.filename, 
					parts_files_data.description
			FROM parts_files 
				LEFT JOIN parts_files_data 
					ON parts_files.id_files=parts_files_data.id
			WHERE parts_files.id_parts='$id_parts'
			ORDER BY description,filename";
	$result=$conn->do_query($sql);
	$documents=$conn->result_to_array($result,false);
	$conn=null;
	return $documents;	
}

?>



