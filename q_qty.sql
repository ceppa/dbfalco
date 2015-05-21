SELECT items_grouped.*,items2.qty FROM `items_grouped`
					INNER JOIN 
					(
						SELECT i1.id,count(i2.id) as qty
						FROM `items_grouped` AS i1
							INNER JOIN `items_grouped` AS i2
							ON IFNULL(i1.sn,'')=IFNULL(i2.sn,'') AND i1.location=i2.location AND i1.position=i2.position
								AND i1.id_parts=i2.id_parts AND i1.id_owners=i2.id_owners 
						GROUP BY i1.id
					) AS items2 
					ON items_grouped.id=items2.id
