<?php
	$version = '0.0.1';
	$linesPerPage=20;

	if(isset($_SESSION["pass"]))
		$login_password = $_SESSION["pass"];
	$check_ip = true;
	$do_time_out = false;
	$session_time = 0.5;
	$luser_tries = 1;
	$big_luser = 10;

	$self=$_SERVER["PHP_SELF"]."?time=".time();

	define("ACCESS_WAREHOUSE", 1);
	define("ACCESS_QTB", 2);
?>
