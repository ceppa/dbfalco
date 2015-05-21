<?php
//require_once("include/datetime.php");
require_once("config.php");

	global $version,$siteName;
?>
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
	<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="it">
	<head>
	<link rel="icon" href="favicon.png" />
	<title><?=$siteName?></title>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta name="description" content="envysoft secure authentication" />
	<meta name="keywords" content="php,javascript,authentication,md5,hashing,php,javascript,authenticating,auth,AUTH,secure,secure login,security,php and javascript secure authentication,combat session fixation!" />
	<script type="text/javascript" src="js/md5.js"></script>
	<script type="text/javascript" src="js/datetime.js"></script>
	<script type="text/javascript" src="js/util.js"></script>
	<script type="text/javascript" src="js/jquery-1.8.2.js"></script>
	<script type="text/javascript" src="js/jquery.autocomplete.js"></script>
	<script type="text/javascript" src="js/jquery.form.min.js"></script>
	<script type="text/javascript" src="js/jquery.positionBy.js"></script>
	<script type="text/javascript" src="js/jquery.bgiframe.js"></script>
	<script type="text/javascript" src="js/jquery.jdMenu.js"></script>
	<script type="text/javascript" src="js/auth.js"></script>
	<script type="text/javascript" src="js/main.js"></script>
	<script type="text/javascript" src="js/users.js"></script>
	<script type="text/javascript" src="js/forms.js"></script>
	<script type="text/javascript" src="js/fleet.js"></script>
	<script type="text/javascript" src="js/uav.js"></script>
	<script type="text/javascript" src="js/places.js"></script>
	<script type="text/javascript" src="js/movements.js"></script>
	<script type="text/javascript" src="js/items.js"></script>
	<script type="text/javascript" src="js/parts.js"></script>
	<script type="text/javascript" src="js/airports.js"></script>
	<script type="text/javascript" src="js/crew.js"></script>
	<script type="text/javascript" src="js/qtb.js"></script>
	<script type="text/javascript" src="js/reports.js"></script>
	<script type="text/javascript" src="js/flexigrid.pack.js"></script>
	<script type="text/javascript" src="js/jquery-ui.js"></script>
	<script type="text/javascript" src="js/jquery-ui-timepicker-addon.js"></script>
	<link rel="stylesheet" href="css/style.css" title="envysheet" type="text/css" />
	<link rel="stylesheet" href="css/forms.css" title="envysheet" type="text/css" />
	<link rel="stylesheet" href="css/flexigrid.pack.css" title="envysheet" type="text/css" />
	<link rel="stylesheet" href="css/autocomplete.css" title="envysheet" type="text/css" />
	<link rel="stylesheet" type="text/css" media="all" href="css/jquery.jdMenu.css" />
	<link rel="stylesheet" type="text/css" href="css/jquery-ui.css" />
	<link rel="stylesheet" type="text/css" href="css/jquery-ui-timepicker-addon.css" />
	</head>
	<body>
		<div id="admin_nav"	style="display:none">
		</div>
		<div id="content">
			<div id="div_wait" style="display:none">
				<img src='img/wait.gif' 
					style='display: block; margin-left: auto; margin-right: auto;' />
			</div>
			<div id="div_expired" style="display:none"></div>
			<div id="div_forgotten" style="display:none"></div>
			<div id="div_main"></div>
			<div id="div_flexi">
			</div>
			<div id="div_auth"></div>
		</div>
	<div id="messageBox" style="display:none">
	</div>
	</body>
	</html>
