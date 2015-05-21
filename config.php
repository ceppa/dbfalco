<?
	ini_set('session.gc_maxlifetime', 5);
	$siteName="http://www.dbfalco.it/";
	$siteAddress="http://www.dbfalco.it/";
	ini_set ('session.name', '$siteName');
	error_reporting(E_ALL);
	session_start();
	if((basename($_SERVER["PHP_SELF"])!="auth.php")
		&&(basename($_SERVER["PHP_SELF"])!="index.php"))
	{
		if(!isset($_SESSION["id_fleet"]))
			die();
	}

?>
