<?php
	header('Cache-Control: no-transform');
	include_once('../config.php');
	echo  "<?xml version='1.0' encoding='utf-8'?>\n";
	echo "<xml>";
	switch($_POST['action']){
		case 'new':
			if (file_exists('../SQL/'.$_POST['title'].'.sql')){
				echo "<error>file exists</error>";
			}else{
				$myFile = fopen('../SQL/'.$_POST['title'].'.sql','w');
			}
			break;
		case 'save':
			//moves current file to 
			rename('../SQL/'.$_POST['title'].'.sql','../SQL/Previous/'.$_POST['title'].' - '.date('ymd_His').'.sql');
			$myFile = fopen('../SQL/'.$_POST['title'].'.sql','w');
				fwrite($myFile,$_POST['sql']);
			fclose($myFile);
			break;
		case 'delete':
			//moves file to trash folder
			rename('../SQL/'.$_POST['title'].'.sql','../SQL/Trash/'.$_POST['title'].' - '.date('ymd').'.sql');
			break;
		case 'get_table':
			$sql  = $_POST['sql'];
			switch($_POST['db']){
				case 'mssql':
					//tables
					$sql = "SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_CATALOG LIKE '$database'";
					echo _mssql($sql);
					break;
				case 'mysql':
					//tables
					$sql = "SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA LIKE '$database'";
					echo _mysql($table);
					break;
			}
		
			
			
			break;
	}
	
	
	function _mssql($tsql){
		global $hostname,$database,$username,$password,$type;
		$connectionInfo = array('Database'=>$database,'UID'=>$username,'PWD'=>$password,'ReturnDatesAsStrings'=> true,'CharacterSet'=>'UTF-8');
		$conn = sqlsrv_connect( $hostname, $connectionInfo) OR die('Connection to host is failed, perhaps the service is down!');
		
		$t = valid($tsql,$type);
		$tsql = explode(';',$t);
		$result = sqlsrv_query($conn,$tsql[0],null,array('Scrollable'=>SQLSRV_CURSOR_FORWARD));

		return buildSQL($result,$tsql[0]);
	}
	
	function _mysql($sql){
		global $hostname,$database,$username,$password,$port,$type;
		$mysqli = mysqli_connect($hostname, $username, $password, $database, $port);
		$t = valid($sql,$type);
		$sql = explode(';',$t);
		
		if (count($sql)==2){
			$mysqli->query($sql[0]);
			$_sql = $sql[1];
		}else{
			$_sql = $sql[0];
		}
		$result = $mysqli->query($_sql);
		
		return buildSQL($result,$_sql);
	}
	echo "</xml>";
?>