<?

	$query_items_life_having='';


	function do_query_warehouse_latency($fields="",$where="",$order="")
	{
		if(strlen($order==0))
			$order='ORDER BY place,parts.pn';
		if(strlen($fields)==0)
			$fields='mi3.id_items,(ifnull(m.date,"0000-00-00")) as date';
		$query='select {fields}
		from movements_items mi3 left join 
		(
			select movements_items.id_items,substr(min(concat(m1.date,m1.id)),20) AS id_movements
			from movements_items join 
			(
				select movements_items.id_items,max(ifnull(movements.date,"0000-00-00")) AS max_date
					from movements_items 
						join movements on movements.id = movements_items.id_movements
			    	join places_all ON movements.id_places_to=places_all.id and ifnull(places_all.id_places_types,0)!=1
				group by movements_items.id_items
			) mi on movements_items.id_items=mi.id_items
			join movements as m1 on movements_items.id_movements=m1.id and m1.date>mi.max_date
			group by movements_items.id_items
		) mi4
		on mi3.id_items=mi4.id_items and mi3.id_movements=mi4.id_movements
		join items on mi3.id_items=items.id
		join parts on items.id_parts=parts.id
		join movements m ON mi4.id_movements=m.id 
		join places_all on m.id_places_to=places_all.id and places_all.id_places_types=1
		{where}
		{order}';
	
		$query=str_replace("{fields}",$fields,$query);
		$query=str_replace("{where}",$where,$query);
		$query=str_replace("{order}",$order,$query);

		return $query;
	}



	function do_query_items_life($query_items_life_fields="",$query_items_life_join="",$query_items_life_having="",$query_items_life_order="")
	{
		if(strlen($query_items_life_order==0))
			$query_items_life_order='ORDER BY bsd.ordine';
		if(strlen($query_items_life_fields)==0)
			$query_items_life_fields='mi.id_items as id, 
				sum(qtb.stick_off-stick_on) as stick,
				sum(qtb.block_on-qtb.block_off) as block,
				sum(qtb.hobbs_off-qtb.hobbs_on) as hobbs,
				sum(qtb.cycles) as cycles,
				movements.`date` as install_date, 
				bsd.description, 
				bsd.repl_flight_hours,
				bsd.repl_engine_hours,
				bsd.repl_cycles,
				bsd.repl_months';

		$query_items_life='
			select {query_items_life_fields}
			from movements_items 
			join
			(
				select movements_items.id_items AS id_items,
						max(ifnull(items_refurbished.date,"0000-00-00")) as items_refurbished_date,
						substr(max(concat(movements.date,movements.id)),20) AS id_movements,
						qtb.id as qtb_id
				from movements_items 
					join movements on movements.id = movements_items.id_movements
	                join qtb ON qtb.record_data>movements.date 
	                left join items_refurbished on movements_items.id_items=items_refurbished.id_items
				group by movements_items.id_items,qtb.id
			) mi
				on movements_items.id_movements=mi.id_movements AND movements_items.id_items=mi.id_items
			{query_items_life_join}
			join movements 
				on movements_items.id_movements=movements.id
			join places_all 
				on movements.id_places_to=places_all.id 
	        join qtb 
				on mi.qtb_id=qtb.id and places_all.id_uav=qtb.uav_id 
					and qtb.record_data>mi.items_refurbished_date
			right join bsd 
				on movements_items.id_bsd = bsd.id 
					AND (bsd.repl_flight_hours>0 
						OR repl_engine_hours>0 
						OR repl_cycles>0 
						OR repl_months>0)
			where  movements_items.id_items is not null
			group by mi.id_items
			{query_items_life_having}
			{query_items_life_order}';
		$query_items_life=str_replace("{query_items_life_fields}",$query_items_life_fields,$query_items_life);
		$query_items_life=str_replace("{query_items_life_join}",$query_items_life_join,$query_items_life);
		$query_items_life=str_replace("{query_items_life_having}",$query_items_life_having,$query_items_life);
		$query_items_life=str_replace("{query_items_life_order}",$query_items_life_order,$query_items_life);
		return $query_items_life;
	}




require_once("const.php");
require_once("util.php");
require_once("../config.php");

$op=(isset($_REQUEST["op"])?$_REQUEST["op"]:"");
switch($op)
{
	case "BSDReportPost":
		if(!isset($_POST["id_uav"]))
		{
			echo json_encode(array("message"=>"id_uav not defined"));
			die();
		}
		$id_uav=$_POST["id_uav"];
		
		require_once("mysql.php");
		$conn=new mysqlConnection;

		$sql="SELECT sn,marche FROM uav WHERE id='$id_uav'"; 
		$result = $conn->do_query($sql);
		$rows=$conn->result_to_array($result);
		if(count($rows)!=1)
		{
			echo json_encode(array("message"=>"no uav with id $id_uav"));
			die();
		}
		$uav_sn=$rows[0]["sn"];
		$uav_sign=$rows[0]["marche"];

		$sql="SELECT bsd.livello,bsd.just_title,bsd.optional,IFNULL(parts.pn,bsd.pn) AS pn,
				bsd.description,items_grouped.sn,items_grouped.install_date,
				DATE_FORMAT(items_grouped.install_date,'%e-%b-%y') AS install_date_formatted
			FROM uav join places_all 
				ON uav.id=places_all.id_uav 
			JOIN bsd 
				ON uav.uav_type_id=bsd.uav_type_id AND uav.id='$id_uav'
			LEFT JOIN items_grouped 
				ON bsd.id=items_grouped.id_bsd AND items_grouped.id_places=places_all.id
			LEFT JOIN parts
				ON parts.id=items_grouped.id_parts
			ORDER BY bsd.ordine";
		$result = $conn->do_query($sql);
		$rows=$conn->result_to_array($result);
		$conn=null;
		echo json_encode(array("message"=>"","uav_sn"=>$uav_sn,"uav_sign"=>$uav_sign,"rows"=>$rows));
		break;
	case "inventoryReportPost":
		$id_fleet=$_SESSION["id_fleet"];
		$where="WHERE fleet.id IN ($id_fleet)";
		$having="";
		$params=array();
		$and=array();
		$or=array();
		$andhaving=array();
		$orhaving=array();
		
		foreach($_POST as $k=>$v)
		{
			if(substr($k,0,4)=="sel_")
			{
				$k=substr($k,4);
				$kk=$k;
				$kk=str_replace("POpen","(",$kk);
				$kk=str_replace("PClose",")",$kk);
				$kk=str_replace("PSpace"," ",$kk);
				$kk=str_replace("PPoint",".",$kk);

				if(isset($_POST["and_".$k])&&(strlen($_POST["and_".$k])))
				{
					$andvalue=$_POST["and_".$k];
					if(strstr($andvalue,"%")!==FALSE)
						$condition="$kk LIKE '".str_replace("'","\'",$andvalue)."'";
					elseif(in_array(substr($andvalue,0,1),array(">","<","=")))
					{
						$i=0;
						while(($i<strlen($andvalue))&&in_array(substr($andvalue,$i,1),array(">","<","=")))
							$i++;
						$condition=$kk.substr($andvalue,0,$i)."'".str_replace("'","\'",substr($andvalue,$i))."'";
					}
					else
						$condition="$kk='".str_replace("'","\'",$andvalue)."'";
						
					if(stripos($kk,"COUNT(")!==FALSE)
						$andhaving[]=$condition;
					else
						$and[]=$condition;
				}
				if(isset($_POST["or_".$k])&&(strlen($_POST["or_".$k])))
				{
					$orvalue=$_POST["or_".$k];
					if(strstr($orvalue,"%")!==FALSE)
						$condition="$kk LIKE '".str_replace("'","\'",$orvalue)."'";
					elseif(in_array(substr($orvalue,0,1),array(">","<","=")))
					{
						$i=0;
						while(($i<strlen($orvalue))&&in_array(substr($orvalue,$i,1),array(">","<","=")))
							$i++;
						$condition=$kk.substr($orvalue,0,$i)."'".str_replace("'","\'",substr($orvalue,$i))."'";
					}
					else
						$condition="$kk='".str_replace("'","\'",$orvalue)."'";
						
					if(stripos($kk,"COUNT(")!==FALSE)
						$orhaving[]=$condition;
					else
						$or[]=$condition;
				}
				if(isset($_POST["desc_".$k]))
					$kk.=" DESC";

				$params[$v]=$kk;
			}
		}
		ksort($params);
		$order=implode(",",$params);
		$whereand="1";
		$whereor="0";
		$havingand="1";
		$havingor="0";
		if(count($and))
			$whereand="(".implode(" AND ",$and).")";
		if(count($or))
			$whereor="(".implode(" OR ",$or).")";

		if(count($andhaving))
			$havingand="(".implode(" AND ",$andhaving).")";
		if(count($orhaving))
			$havingor="(".implode(" OR ",$orhaving).")";

		
		$fields=str_replace(" DESC","",$order);
		require_once("mysql.php");
		$conn=new mysqlConnection;
	
		$sql="SELECT $fields 
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
			$where AND $whereand OR $whereor
			GROUP BY sn,
					items_grouped.id_places,
					items_grouped.location,
					items_grouped.position,
					parts.id
			HAVING $havingand OR $havingor
			ORDER BY $order";
		;
		$result = $conn->do_query($sql);
		$rows=array();
		while($row=$result->fetch_row())
					$rows[]=$row;
		$result->free_result();
		$conn=null;
		echo json_encode($rows);
		break;
	case "UAVpartslife":
		require_once("mysql.php");
		$page=(isset($_POST['page'])?$_POST['page']:1);
		$rp=(isset($_POST['rp'])?$_POST['rp']:15);
		$sortname=(isset($_POST['sortname'])?$_POST['sortname']:"");
		$sortorder=(isset($_POST['sortorder'])?$_POST['sortorder']:"");
		$uav_id=(isset($_POST['uav_id'])?$_POST['uav_id']:"");
	
		if(!$sortname)
			$sortname="bsd.ordine";
		if(!$sortorder)
			$sortorder="asc";

		$sort="ORDER BY $sortname $sortorder";
		$query=(isset($_REQUEST['query'])?$_REQUEST['query']:"");
		$qtype=(isset($_REQUEST['qtype'])?$_REQUEST['qtype']:"");
	
		$where="HAVING qtb.uav_id='$uav_id'";
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
	
		$query_items_life_join='join items on movements_items.id_items=items.id
							join parts on items.id_parts=parts.id';


		$query_items_life_fields='mi.id_items as id, 
			sum(qtb.stick_off-stick_on) as stick,
			sum(qtb.block_on-qtb.block_off) as block,
			sum(qtb.hobbs_off-qtb.hobbs_on) as hobbs,
			sum(qtb.cycles) as cycles,
			movements.`date` as install_date,
			period_diff(date_format(now(), "%Y%m"),date_format(movements.`date`, "%Y%m")) as months,
			bsd.description,
			items.sn,
			bsd.repl_flight_hours,
			bsd.repl_engine_hours,
			bsd.repl_cycles,
			bsd.repl_months,
			qtb.uav_id,
			parts.pn';

		$sql=do_query_items_life($query_items_life_fields,$query_items_life_join,$where,$sort);
		$result = $conn->do_query($sql);
		$total = $result->num_rows;
		$result->close();

		$sql.="	$limit";
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
						$row['pn'],
						$row['description'], 
						$row['sn'], 
						$row['stick'], 
						$row['hobbs'], 
						$row['cycles'], 
						$row['months'], 
						$row['repl_flight_hours'], 
						$row['repl_engine_hours'], 
						$row['repl_cycles'], 
						$row['repl_months']
					)
			);
		}
		echo json_encode($data);
		die();
		break;
	case "warehouselife":
		require_once("mysql.php");
		$page=(isset($_POST['page'])?$_POST['page']:1);
		$rp=(isset($_POST['rp'])?$_POST['rp']:15);
		$sortname=(isset($_POST['sortname'])?$_POST['sortname']:"");
		$sortorder=(isset($_POST['sortorder'])?$_POST['sortorder']:"");
	
		if(!$sortname)
			$sortname="place";
		if(!$sortorder)
			$sortorder="asc";
	
		$sort="ORDER BY $sortname $sortorder";
		$query=(isset($_REQUEST['query'])?$_REQUEST['query']:"");
		$qtype=(isset($_REQUEST['qtype'])?$_REQUEST['qtype']:"");
	
		$where="";
		if($qtype) 
			$where.="$qtype LIKE '%$query%'";
	
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
	

		$fields='items.id as id,
			parts.pn as pn, 
			parts.description as description,
			items.sn as sn,
			places_all.description as place,
			ifnull(m.date,"0000-00-00") as date';

		$sql=do_query_warehouse_latency($fields,$where,$sort);
	echo "gomp$sqls";
		$result = $conn->do_query($sql);
		$total = $result->num_rows;
		$result->close();
		$sql.="	$limit";
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
						$row['pn'],
						$row['description'], 
						$row['sn'], 
						$row['date']
					)
			);
		}
		echo json_encode($data);
		die();
		break;
}


?>
