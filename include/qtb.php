<?php
require_once("const.php");
require_once("util.php");
require_once("../config.php");

$op=(isset($_REQUEST["op"])?$_REQUEST["op"]:"");
switch($op)
{
	case "showUavMenu":
		qtbUavMenu();
		break;
	case "list":
		require_once("mysql.php");
		$page = $_POST['page'];
		$rp = $_POST['rp'];
		$sortname = $_POST['sortname'];
		$sortorder = $_POST['sortorder'];
		$uav_id=$_POST['uav_id'];
	
		if(!$sortname)
			$sortname="operator";
		if(!$sortorder)
			$sortorder="asc";
	
		$sort = "ORDER BY $sortname $sortorder";
		$query = $_REQUEST['query'];
		$qtype = $_REQUEST['qtype'];
	
		$where="WHERE qtb.uav_id='$uav_id' AND q.id is NULL";
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
	
		$sql="SELECT qtb.* 
				FROM qtb
				LEFT JOIN qtb q ON qtb.id=q.replaces_qtb_id
				LEFT JOIN airports airport_from ON airport_from.id=qtb.apt_from_id
				LEFT JOIN airports airport_to ON airport_to.id=qtb.apt_to_id
				LEFT JOIN crew crew_pilot ON qtb.pilot_id=crew_pilot.id
				LEFT JOIN crew crew_pilot_2 ON qtb.pilot_2_id=crew_pilot_2.id
				LEFT JOIN crew crew_pilot_3 ON qtb.pilot_3_id=crew_pilot_3.id
				LEFT JOIN crew crew_pilot_4 ON qtb.pilot_4_id=crew_pilot_4.id
			$where";
	
		$result = $conn->do_query($sql);
		$total = $result->num_rows;
		$result->close();
	
	
		$sql="SELECT qtb.*,airport_from.IATA AS apt_from,airport_to.IATA AS apt_to,
					IFNULL(crew_pilot.name,'---') AS pilot,
					IFNULL(crew_pilot_2.name,'---') AS pilot_2,
					IFNULL(crew_pilot_3.name,'---') AS pilot_3,
					IFNULL(crew_pilot_4.name,'---') AS pilot_4
				FROM qtb
				LEFT JOIN qtb q ON qtb.id=q.replaces_qtb_id
				LEFT JOIN airports airport_from ON airport_from.id=qtb.apt_from_id
				LEFT JOIN airports airport_to ON airport_to.id=qtb.apt_to_id
				LEFT JOIN crew crew_pilot ON qtb.pilot_id=crew_pilot.id
				LEFT JOIN crew crew_pilot_2 ON qtb.pilot_2_id=crew_pilot_2.id
				LEFT JOIN crew crew_pilot_3 ON qtb.pilot_3_id=crew_pilot_3.id
				LEFT JOIN crew crew_pilot_4 ON qtb.pilot_4_id=crew_pilot_4.id
			$where
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
						$row['record_data'],
						$row['apt_from'],
						$row['apt_to'],
						$row['pilot'],
						$row['pilot_2'],
						$row['pilot_3'],
						$row['pilot_4']
					)
			);
		}
		echo json_encode($data);
		die();
		break;
	case "add":
	case "edit":
		if($op=="edit")
		{
			$id_value=substr($_POST["id"],3);
			$id_field="id";
			$id="$id_field,$id_value";
			$title="Modifica UTL";
		}
		else
		{
			$id="";
			$title="Inserisci nuovo UTL";
		}
			
		$fields=array(
			"user_id"=>array("type"=>"hidden","value"=>$_SESSION["id"]),
			"record_data"=>array("value"=>"","label"=>"Date"),
			"apt_from_id"=>array("value"=>"","label"=>"From",
				"link"=>array("table"=>"airports"
				,"id"=>"id","text"=>"description"
				,"where"=>"active=1")
			),
			"apt_to_id"=>array("value"=>"","label"=>"To",
				"link"=>array("table"=>"airports"
				,"id"=>"id","text"=>"description"
				,"where"=>"active=1")
			),
			"pilot_id"=>array("value"=>"","label"=>"Pilot",
				"link"=>array("table"=>"crew"
				,"id"=>"id","text"=>"name")
			),
			"pilot_time"=>array("value"=>"","label"=>"Pilot time (min)"),
			"pilot_2_id"=>array("value"=>"","label"=>"Pilot 2",
				"link"=>array("table"=>"crew"
				,"id"=>"id","text"=>"name")
			),
			"pilot_2_time"=>array("value"=>"","label"=>"Pilot 2 time (min)"),
			"pilot_3_id"=>array("value"=>"","label"=>"Pilot 3",
				"link"=>array("table"=>"crew"
				,"id"=>"id","text"=>"name")
			),
			"pilot_3_time"=>array("value"=>"","label"=>"Pilot 3 time (min)"),
			"pilot_4_id"=>array("value"=>"","label"=>"Pilot 4",
				"link"=>array("table"=>"crew"
				,"id"=>"id","text"=>"name")
			),
			"pilot_4_time"=>array("value"=>"","label"=>"Pilot 4 time (min)"),
			"block_off"=>array("value"=>"","label"=>"Block off"),
			"block_on"=>array("value"=>"","label"=>"Block on"),
			"stick_on"=>array("value"=>"","label"=>"Stick on"),
			"stick_off"=>array("value"=>"","label"=>"Stick off"),
			"hobbs_on"=>array("value"=>"","label"=>"Hobbs on"),
			"hobbs_off"=>array("value"=>"","label"=>"Hobbs off"),
			"cycles"=>array("value"=>"","label"=>"Cycles")
		);
	
		require_once("forms.php");
		ob_start();
		showForm($id,"qtb",$fields,$title);
		$form=ob_get_clean();
		echo json_encode(array("form"=>$form));
		die();
	case "checkBsdComplete":
		$date=(isset($_POST["date"])?$_POST["date"]:"");
		$uav_id=(isset($_POST["uav_id"])?$_POST["uav_id"]:"");
		if(strlen($date)&&strlen($uav_id))
		{
			require_once("functions.php");
			echo json_encode(checkBsdComplete($uav_id,$date));
		}
		die();
	default:
		break;
}


function qtbUavMenu()
{
	ob_start();
	$id_fleet=$_SESSION["id_fleet"];
	$where = "WHERE id_fleet IN($id_fleet)";
	if($_SESSION["livello"]==3)
		$where="WHERE 1";

	require_once("mysql.php");
	$query="SELECT uav.id,uav.marche,uav.sn,uav.id_fleet FROM uav
			$where
			ORDER BY uav.id_fleet,uav.marche";
	$conn=new mysqlConnection;
	$result=$conn->do_query($query,false);
	$message=ob_get_contents();
	$body="";

	if($result)
	{
		$rows=$conn->result_to_array($result,false);
		if(count($rows)==0)
		{
			$message="No UAV associated to current user, contact administrator";
			$status=1;
		}
		else
		{
?>
<div id="div_QtbUavSelect">
<?php	
		foreach($rows as $row)
                {?>
                    <span id="UAV_<?=$row["id"]?>"><?=$row["marche"]?></span>
<?php
                }
?>
	<span id="UAV_incomplete">Configuration is incomplete<div id="UAV_incomplete_details"></div></span>
</div>
<?php
			$body=ob_get_clean();
			$status=0;
		}
	}
	else
		$status=1;

	$conn=null;

	$out=array("message"=>$message,"status"=>$status,"body"=>$body);
	echo json_encode($out);
}

?>
