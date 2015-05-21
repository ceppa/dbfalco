<?php

/* connect to database */
require_once('../config.php');
require_once('mysql.php');
require_once('functions.php');
$excluded=rtrim($_GET["exclude"],",");
if(!strlen($excluded))
	$excluded="''";
$q=strtolower($_GET["q"]);
if(!$q)
	return;

$conn=new mysqlConnection;
$linkAppend="";
if(isset($_GET["from"]))
{
	$linkAppend=" AND items_grouped.id_places='".$_GET["from"]."' ";
	if((isset($_REQUEST["mustMatch"])&&($_REQUEST["mustMatch"]=="0")))
		$whereAppend="AND (items_grouped.id_places='".$_GET["from"]."' 
			OR parts.id_suppliers='".$_GET["from"]."') ";
	else
		$whereAppend="AND items_grouped.id_places='".$_GET["from"]."' ";
}
else
	$whereAppend="";

if(!isset($_GET["sn"]))
{
	$sql="(SELECT parts.pn AS parts_pn,
					parts.description AS parts_description,
					parts.id AS id_parts, 
					count(items_grouped.id) AS conta,
					items_grouped.licence_number AS parts_pn_other,
					0 as lic 
					FROM parts 
						LEFT JOIN items_grouped 
						ON parts.id=items_grouped.id_parts 
						$linkAppend 
						WHERE parts.pn LIKE '%".$q."%' 
					$whereAppend 
					AND parts.id NOT IN ($excluded) 
					GROUP BY parts.id)
			UNION 
			(SELECT items_grouped.licence_number AS parts_pn,
					parts.description AS parts_description,
					parts.id AS id_parts,
					count(items_grouped.id) AS conta,
					parts.pn AS parts_pn_other,
					1 as lic 
					FROM parts 
						LEFT JOIN items_grouped 
						ON parts.id=items_grouped.id_parts 
						$linkAppend 
					WHERE items_grouped.licence_number LIKE '%".$q."%' 
					$whereAppend 
					AND parts.id NOT IN ($excluded)
					GROUP BY parts.id) 
				ORDER BY (conta>0) desc,parts_pn";
}
else
{
		$sql =	"SELECT	items_grouped.sn AS parts_sn,
					parts.description AS parts_description,
					items_grouped.id AS items_id,
					parts.id AS parts_id,
					parts.pn AS parts_pn 
					FROM parts 
						LEFT JOIN items_grouped 
						ON parts.id=items_grouped.id_parts 
						WHERE items_grouped.sn LIKE '%".$q."%' 
						$whereAppend 
					AND parts.id NOT IN ($excluded) 
			ORDER BY parts_sn";
}
/*
$logfile = fopen("log.log", "a+"); 
fwrite($logfile,"mastmatch=".$_REQUEST["mustMatch"]."\r\n\r\n");
fwrite($logfile,$sql."\r\n\r\n");
fclose($logfile);
*/
$resultString="";

$result = $conn->do_query($sql);
$rows=$conn->result_to_array($result,false);

$conn=null;
foreach($rows as $row)
{
	$row=array_values($row);
	if(!isset($row[5]))
		$row[5]="";
	$resultString .= $row[0]."|".nlTobr($row[1])."|".
			$row[2]."|".$row[3]."|".$row[4]."|".$row[5]."\n";
}
echo $resultString;
?>
