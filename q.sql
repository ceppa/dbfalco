select items.id AS id,
	items.id_parts AS id_parts,
	items.id_owners AS id_owners,
	items.sn AS sn,
	items.spare AS spare,
	items.id_users_creator AS id_users_creator,
	items.id_users_updater AS id_users_updater,
	movements_items.to_repair AS to_repair,
	movements_items.id_bsd AS id_bsd,
	movements_items.location AS location,
	movements.id_places_to AS id_places from 
items 
left join movements_items 
	on items.id = movements_items.id_items 
left join movements on movements_items.id_movements = movements.id 
order by movements.date desc



select ig1.id AS id_items,
	ig2.id AS id_items_2,
	ig2.id_bsd AS id 
from 
items_grouped ig1 
join bsd_compatible bc1 on ig1.id_parts = bc1.id_parts 
join bsd_compatible bc2 on bc1.id = bc2.id 
join items_grouped ig2 on bc2.id_parts = ig2.id_parts) and (ig2.id_places = ig1.id_places)
where ((ig1.id <> ig2.id) and (ig2.id_bsd is not null))




items_grouped

select items.id AS id,
	items.id_parts AS id_parts,
	items.id_owners AS id_owners,
	items.sn AS sn,
	items.spare AS spare,
	items.id_users_creator AS id_users_creator,
	items.id_users_updater AS id_users_updater,
	movements_items.to_repair AS to_repair,
	movements_items.id_bsd AS id_bsd,
	movements_items.location AS location,
	movements.id_places_to AS id_places 
from 
movements_items 
join
(
	select movements_items.id_items AS id_items,
		substr(max(concat(movements.date,movements.id)),20) AS id_movements 
	from movements_items 
		join movements on movements.id = movements_items.id_movements
	group by movements_items.id_items
) mi 
	on movements_items.id_items = mi.id_items 
		and movements_items.id_movements = mi.id_movements
join items 
	on movements_items.id_items = items.id
join movements 
	on movements_items.id_movements = movements.id
join places_all 
	on movements.id_places_to = places_all.id



bsd_complete

select bsd.id AS id,
	bsd.description,
	movements_items.id_items
from 
movements_items 
join
(
	select movements_items.id_items AS id_items,
		substr(max(concat(movements.date,movements.id)),20) AS id_movements 
	from movements_items 
		join movements on movements.id = movements_items.id_movements and movements.date < "2014-07-01"
	group by movements_items.id_items
) mi 
	on movements_items.id_items = mi.id_items 
		and movements_items.id_movements = mi.id_movements
join movements 
	on movements_items.id_movements=movements.id and movements.id_places_to=5
right join bsd 
	on movements_items.id_bsd = bsd.id
	
	
	
	
	
	
	
compute items life

select mi.id_items, sum(qtb.stick_off-stick_on) as stick,sum(qtb.block_on-qtb.block_off) as block,sum(qtb.hobbs_off-qtb.hobbs_on) as hobbs,sum(qtb.cycles) as cycles,
	movements.`date` as install_date, bsd.description, bsd.repl_flight_hours,bsd.repl_engine_hours,bsd.repl_cycles,bsd.repl_months
from movements_items 
JOIN
(
    select movements_items.id_items AS id_items,max(ifnull(items_refurbished.date,"0000-00-00")) as items_refurbished_date,
				substr(max(concat(movements.date,movements.id)),20) AS id_movements,
                qtb.id as qtb_id
			from movementselect substr(min(concat(m1.date,m1.id)),20) AS id_movements
from movements_items join 
(
	select movements_items.id_items,max(ifnull(movements.date,"0000-00-00")) AS max_date
		from movements_items 
			join movements on movements.id = movements_items.id_movements
    	join places_all ON movements.id_places_to=places_all.id and places_all.id_places_types!=1
	group by movements_items.id
) mi on movements_items.id_items=mi.id_items
join movements as m1 on movements_items.id_movements=m1.id and m1.date>mi.max_date
group by movements_items.id_items
s_items 
				join movements on movements.id = movements_items.id_movements
                join qtb ON qtb.record_data>movements.date 
                left join items_refurbished on movements_items.id_items=items_refurbished.id_items
			group by movements_items.id_items,qtb.id
) mi
on movements_items.id_movements=mi.id_movements AND movements_items.id_items=mi.id_items
		join movements 
			on movements_items.id_movements=movements.id
		join places_all on movements.id_places_to=places_all.id 
        join qtb on mi.qtb_id=qtb.id and places_all.id_uav=qtb.uav_id and qtb.record_data>mi.items_refurbished_date
		right join bsd 
			on movements_items.id_bsd = bsd.id AND (bsd.repl_flight_hours>0 OR repl_engine_hours>0 OR repl_cycles>0 OR repl_months>0)
		where  movements_items.id_items is not null

group by mi.id_items



compute warehouse latency

select mi3.id_items,(ifnull(m.date,"0000-00-00")) as date
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
join movements m ON mi4.id_movements=m.id 
join places on m.id_places_to=places.id and places.id_places_types=1

