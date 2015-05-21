<?
require_once('mysql.php');

$q = strtolower($_GET["q"]);
/*if(!$q)
	die();*/

$conn=new mysqlConnection;
$query="SELECT comune.id,comune.descrizione AS comune,
		comune.cap,comune.provincia_id
		,provincia.descrizione AS provincia
	FROM comune LEFT JOIN provincia
		ON comune.provincia_id=provincia.id
	WHERE comune.descrizione LIKE '%$q%' ORDER BY comune.descrizione";

$result=$conn->do_query($query);
$rows=$conn->result_to_array($result,false);

$resultString="";
foreach($rows as $row)
	$resultString .= sprintf("%s|%s|%d|%d|%05d\n",
			$row["comune"],
			$row["provincia"],
			$row["id"],
			$row["provincia_id"],
			$row["cap"]);
echo $resultString;
$conn=null;
?>
