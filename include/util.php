<?php
function drawTable($rows,$columns)
{
?>
	<table class="center">
		<tr class="header">
<?php
	foreach($columns as $array)
	{
		$text=$array["title"];
	?>
			<td><?=$text?></td>
	<?php
        }?>

<?php
	foreach($rows as $row)
	{?>
		<tr class="row">
	<?php
		foreach($columns as $field=>$array)
		{
			if(strlen($array["align"]))
				$align=$array["align"];
			else
				$align="left";
		?>
			<td style="text-align:<?=$align?>"><?=$row[$field]?></td>
		<?php
                }?>
		</tr>
<?php	}?>
		</tr>
	</table>
<?php
}

function tableRow($readonly,$type,$title,$value)
{
	//$readonly si sa
	//$value è array(varname=>varvalue)
	//$array è eventuale array di valori per select

	$locked_row=($readonly?" class='locked'":"");
	$check_locked=($readonly?" onclick='this.blur();return false;'":"");
	$input_locked=($readonly?" onfocus='this.blur()' onclick='this.blur()'":"");

	$varname=key($value);
	$varvalue=$value[$varname];
?>
	<tr <?=$locked_row?> id="row_<?=$varname?>">
		<td class="right"><?=$title?></td>
		<td class="left">
<?php
		switch($type["type"])
		{
			case "select":
				$values=$type["values"];
				if($readonly)
				{?>
					<input type="hidden" 
						name="<?=$varname?>"
						value="<?=$varvalue?>" />
						<b><?=$values[$varvalue]?></b>
				<?php
                                }
				else
				{?>
					<select id="<?=$varname?>"
						name="<?=$varname?>">
					<?php
						foreach($values as $id=>$value)
						{
							$selected=(strlen($varvalue)&&($varvalue==$id));
						?>
						<option value="<?=$id?>"<?=($selected?" selected='selected'":"")?>>
							<?=$value?>
						</option>
						<?php
                                                }?>
					</select>
				<?php
                                }
				break;
			case "textarea":
				$cols=$type["cols"];
				$rows=$type["rows"];
				?>
					<textarea name="<?=$varname?>" cols="<?=$cols?>" rows="<?=$rows?>"
						class="input"<?=$input_locked?>><?=$varvalue?>
					</textarea>
				<?php
				break;
			case "input":
				$maxlength=$type["maxlength"];
				$size=$type["size"];
				?>
					<input type="text" 
						name="<?=$varname?>" 
						id="<?=$varname?>" 
						size="<?=$size?>" 
						maxlength="<?=$maxlength?>" 
						value="<?=$varvalue?>" 
						<?=$input_locked?> />
				<?php
				break;
			case "date":
			?>
					<input type="text" 
						name="<?=$varname?>" 
						id="<?=$varname?>" 
						size="12" 
						value="<?=$varvalue?>" 
						onclick='showCalendar("", this,this, "dd/mm/yyyy","it",1,0)'
						onchange="" 
						readonly="readonly" />
			<?php
				if(!$readonly)
				{?>
					<img src="img/calendar.png" 
						onmouseover="style.cursor='pointer'" 
						alt="calendar"
						style="height:25px;vertical-align:middle;"
						onclick='showCalendar("", this,document.getElementById("<?=$varname?>"), "dd/mm/yyyy","it",1,0)' />
			<?php	}?>
				</td>
				<?php
				break;
			case "multicheck":
				$values=$type["values"];
				$check_all=$type["check_all"];
				$check_locked=($readonly?" onclick='this.blur();return false;'":"");

				if(($check_all)&&(!$check_locked))
				{?>
					<input type="checkbox" onchange="check_all(this,'<?=$varname?>')">All<br/>

				<?php
                                }
				$varvalue=(int)$varvalue;
				foreach($values as $id=>$value)
				{
					$checked=($varvalue&(1<<$id)?" checked='checked'":"");
					$value=str_replace("&","&amp;",$value);
					$k=str_replace(" ","",$value);
					?>
					<input type="checkbox"
						name="<?=$varname;?>_<?=$k;?>"
						value="<?=$id;?>"<?=$check_locked?><?=$checked?> /><?=$value;?><br/>
					<?php
				}
				break;
			default:
				break;
		}?>
		</td>
	</tr>
<?php
}

function rrmdir($dir)
{
	if (is_dir($dir)) 
	{
		$objects = scandir($dir);
		foreach ($objects as $object)
		{
			if ($object != "." && $object != "..") 
			{
				if (filetype($dir."/".$object) == "dir") 
					rrmdir($dir."/".$object); else unlink($dir."/".$object);
			}
		}
		reset($objects);
		rmdir($dir);
	}
}
?>
