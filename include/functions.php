<?php

function nlTobr($string)
{
	$nls = array("\r\n", "\r", "\n");
	return str_replace($nls,"<br>",$string);
}


function date_to_sql($date)
{
	if($date=="----")
		return "0000-00-00";
	else
	{
		$explode=explode("/",$date);
		$dd=(int)$explode[0];
		$mm=(int)$explode[1];
		$yy=(int)$explode[2];
		return(date("Y-m-d",mktime(0,0,0,$mm,$dd,$yy)));
	}
}

function checkBsdComplete($uav_id,$date)
{
	require_once("mysql.php");

	$sql=sprintf('
	select bsd.id AS id,
		bsd.description
	from
	movements_items
	join
	(
		select movements_items.id_items AS id_items,
			substr(max(concat(movements.date,movements.id)),20) AS id_movements
		from movements_items
			join movements on movements.id = movements_items.id_movements and movements.date < "%s"
		group by movements_items.id_items
	) mi
		on movements_items.id_items = mi.id_items
			and movements_items.id_movements = mi.id_movements
	join movements
		on movements_items.id_movements=movements.id
	join places_all on movements.id_places_to=places_all.id and places_all.id_uav="%d"
	right join bsd
		on movements_items.id_bsd = bsd.id
	join uav
		on uav.id="%d" and bsd.uav_type_id = uav.uav_type_id
	where  movements_items.id_items is null and bsd.optional=0 and bsd.just_title=0',$date,$uav_id,$uav_id);

	$conn=new mysqlConnection;

	$result = $conn->do_query($sql);
	$rows=$conn->result_to_array($result,true);
	$conn=null;
	return $rows;
}

?>
