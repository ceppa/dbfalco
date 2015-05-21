<?
require_once("const.php");
require_once("../config.php");

function display_admin_nav()
{
?>
<ul id="jd_menu" class="jd_menu">
<?
if($_SESSION["livello"]>1)
{?>
	<li id="jd_fleet"><a>Fleet</a>
		<ul>
			<li id="menu_fleet_list"><a>List</a></li>
			<li id="menu_fleet_new"><a>New</a></li>
			<li id="menu_fleet_edit" style="display:none"><a>Edit</a></li>
			<li id="menu_fleet_search"><a>Search</a></li>
		</ul>
	</li>
	<li id="jd_uav"><a>UAV</a>
		<ul>
			<li id="menu_uav_list"><a>List</a></li>
			<li id="menu_uav_new"><a>New</a></li>
			<li id="menu_uav_edit" style="display:none"><a>Edit</a></li>
			<li id="menu_uav_search"><a>Search</a></li>
		</ul>
	</li>
	<li id="jd_admin"><a>Admin</a>
		<ul>
<?
if($_SESSION["livello"]>2)
{?>
			<li id="menu_users_list"><a>Users</a></li>
<?}?>
			<li id="menu_airports_list"><a>Airports</a></li>
			<li id="menu_crew_list"><a>Crew</a></li>
		</ul>
	</li>
<?}
if($_SESSION["warehouse"]==1)
{?>
	<li id="jd_parts" class="warehouse"><a>Parts</a>
		<ul>
			<li id="menu_parts_list"><a>List</a></li>
			<li id="menu_parts_search"><a>Search</a></li>
			<li id="menu_parts_edit" style="display:none"><a>Edit</a></li>
		</ul>
	</li>
	<li id="jd_items" class="warehouse"><a>Inventory</a>
		<ul>
			<li id="menu_items_list"><a>List</a></li>
			<li id="menu_items_search"><a>Search</a></li>
			<li id="menu_items_move" style="display:none"><a>Move</a></li>
			<li id="menu_items_edit" style="display:none"><a>Edit</a></li>
		</ul>
	</li>
	<li id="jd_movements" class="warehouse"><a>Movements</a>
		<ul>
			<li id="menu_movements_list"><a>List</a></li>
			<li id="menu_movements_new"><a>New</a></li>
			<li id="menu_movements_edit" style="display:none"><a>Edit</a></li>
			<li id="menu_movements_search"><a>Search</a></li>
		</ul>
	</li>
	<li id="jd_places" class="warehouse"><a>Places</a>
		<ul>
			<li id="menu_places_list"><a>List</a></li>
			<li id="menu_places_new"><a>New</a></li>
			<li id="menu_places_edit" style="display:none"><a>Edit</a></li>
			<li id="menu_places_search"><a>Search</a></li>
		</ul>
	</li>
<?}
if($_SESSION["qtb"]==1)
{?>
	<li id="jd_qtb" class="qtb"><a>UTL</a>
		<ul>
			<li id="menu_qtb_list"><a>List</a></li>
		</ul>
	</li>
<?}?>
	<li id="jd_reports"><a>Reports</a>
		<ul>
			<li id="menu_reports_UAVpartslife"><a>UAV parts life</a></li>
			<li id="menu_reports_warehouselife"><a>Stored parts lile</a></li>
			<li id="menu_reports_inventory"><a>Inventory</a></li>
			<li id="menu_reports_bsd"><a>BSD</a></li>
		</ul>
	</li>
	<li id="logoutButton" style="float:right" onclick="do_logout()">
		<?=trim($_SESSION["nome"]." ".$_SESSION["cognome"])?>
		<img src="img/stock_exit.png" alt="exit" />
	</li>
</ul>

<?
}

$op = $_REQUEST['op'];
if($op=="display_admin_nav")
{
	display_admin_nav();
	die();
}
elseif($op=="getSessionValue")
{
	if(isset($_SESSION[$_POST["variable"]]))
		echo $_SESSION[$_POST["variable"]];
	die();
}

?>
