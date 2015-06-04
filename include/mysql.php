<?

	class mysqlConnection
	{
		private $dbname="hightecs_dbfalco";
		private $myhost="localhost";
		private $myuser="hightecs_envy";
		private $mypass="minair";
		private $mysqli;

		function __construct()
		{
			$this->mysqli=new mysqli($this->myhost,$this->myuser,$this->mypass,$this->dbname);
			if (mysqli_connect_errno())
				die("Connect failed: ". mysqli_connect_error());

			$this->mysqli->query('SET NAMES utf8');
		}

		function __destruct()
		{
			$this->mysqli->close();
		}

		function affected_rows()
		{
			return $this->mysqli->affected_rows;
		}

		protected function my_die($message)
		{
			$fp = @fopen('error.txt', 'w+');
			if($fp)
			{
				fwrite($fp, "$message\n");
				fclose($fp);
			}
			else
				echo $message;
			die();
		}

		function insert_id()
		{
			return $this->mysqli->insert_id;
		}

		function do_query($query,$die=true)
		{
			if(($result=$this->mysqli->query($query))===false)
			{
				$error=$this->mysqli->error;
				@$this->mysqli->query("ROLLBACK");
				if($die)
					$this->my_die("$query<br>$error");
				else
					echo "$query<br>$error";
			}
			return $result;
		}

		function beginTransaction()
		{
				@$this->mysqli->query("START TRANSACTION");
		}

		function commit()
		{
				@$this->mysqli->query("COMMIT");
		}

		function rollback()
		{
				@$this->mysqli->query("ROLLBACK");
		}

		function result_to_array($result,$useid=true)
		{
			$out=array();
			while($row=$result->fetch_assoc())
			{
				if(isset($row["id"])&&$useid)
				{
					$id=$row["id"];
					unset($row["id"]);
					$out[$id]=$row;
				}
				else
					$out[]=$row;
			}
			$result->free_result();
			return $out;
		}
	}
?>
