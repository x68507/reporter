<?php
	header('Cache-Control: no-transform');
	require_once('../config.php');

	$type = $_POST['type'];
	$sql  = $_POST['sql'];
	
	//Specific column qualifiers (no wrap, mobile visible)
	$ary = array('*','!');
	
	switch($type){
		case 'mssql':
			echo _mssql($sql);
			break;
		case 'mysql':
			echo _mysql($sql);
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
	
	
	function valid($sql,$type){
		$invalid = array('delete','insert','update','alter','drop','merge','create','truncate');
		if (in_array($sql,$invalid)){die('ILLEGAL QUERY.  Can only run SELECT statements with this viewer.');}
		return $sql;
	}
	
	function buildSQL($result,$tsql){
		global $type;
		$str = '';
		
		//regex to find the "searched for" character
			//super lazy and doesn't work for nested quotes, but works for what I need right now
		
		$patt = "/\S*\s*LIKE\s*(\s*|'(?:[^']*)'\+)@[A-z0-9]*/i";
		preg_match_all($patt,$tsql,$m1);
		$col = array();
		if (count($m1[0])>0){
			$patt2 = '/@[A-z0-9]*\s*=\s*(\')(.*?)\1/i';
			preg_match_all($patt2,$tsql,$m2);
			foreach($m1[0] as $v1){
				$t1 = explode('like',strtolower($v1));
				$t2 = explode('@',$v1);
				foreach($m2[0] as $v2){
					if (strpos($v2,'@'.trim($t2[1])) !== false){
						//Find SQLdb column name
						$t3 = (strpos($t1[0],'.')>0?trim(substr($t1[0],-(strlen($t1[0])-strpos($t1[0],'.')-1))):trim($t1[0]));
						
						//Find aliased column name
						$patt3 = "/".$t3.'\s+(\')(.*?)\1/i';
						preg_match($patt3,$tsql,$m3);
						if (count($m3)>0){
							$col[0] = $m3[0];
							//$t4 = trim(substr($m3[0],strpos($m3[0],' ').' '));		
							//$t5 =substr($t4,1,strlen($t4)-2);
							
							//if (strlen($t5)>0) $col[$t5] = substr($v2,strpos($v2,"'")+1,strlen($v2)-strpos($v2,"'")-2);
						}
					}
				}
				unset($t1,$t2,$t3,$t4,$patt3);	
			}
		}
		
		
		$str .= "<table id='tblData' data-filter='#filter' class='footable' class='display' cellspacing='0' width='100%'>";
			$str .= "<thead class='fixed-head'>";
				$level = 'false';
				$dex = 0;
				switch ($type){
					case 'mssql':
						foreach( sqlsrv_field_metadata( $result ) as $header ) {
							$str .= sqlHeader($header['Name'],$dex++);
						}
						break;
					case 'mysql':
						while ($header = $result->fetch_field()){
							$str .= sqlHeader($header->name,$dex++);
						}
						break;
				}
		
			$str .= "</thead><tbody class='fixed-scroll'>";
			switch($type){
				case 'mssql':
					while ($row = sqlsrv_fetch_array($result,SQLSRV_FETCH_ASSOC )){
						$str .= sqlTable($row);
					}
					break;
				case 'mysql':
					
					while ($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
						$str .= sqlTable($row);
					}
					
					break;
					
			}
		$str .= "</tbody></table>";
		if( ($errors = sqlsrv_errors() ) != null) {
			$bError = false;
			
			foreach( $errors as $error ) {
				if ($error['code']!=-28){
					$str .= "SQLSTATE: error[SQLSTATE]<br />code: $error[code]<br />message: $error[message]<br />";
					$bError = true;
				}
			}
			if ($bError==true) $str .= "<hr>".$tsql;
			
		}
		return $str;
	}
	
	function sqlHeader($name,$dex){
		global $ary;
		$title = trimHeader($name);
		//$str = "<th ".((substr($name,0,1)!='!' && $dex!=0)?'data-hide="phone,tablet"':'')." style='white-space:nowrap'>".$title."</th>";
				
				$x = '';
				$mg = '';
				if (strpos($name,'|')){
					$t = explode('|',$name);
					$x = "data-var='".trim($t[1])."'";
					$mg = "<span class='mg-container'><span class='mg'></span></span>";
				}
				
		$str = "<th $x ".((substr($name,0,1)!='!' && $dex!=0)?'data-hide="phone"':'')." style='white-space:nowrap' ".(substr($name,-1)=='*'?'data-type="numeric"':'').">$mg<span data-title='".strtoupper($title)."'>$title</span></th>";
		if (strtolower($name)=='level') $level = $name;
		return $str;
	}
	
	function trimHeader($title){
		global $ary;
		//Removes preceding symbols
		while (in_array(substr($title,0,1),$ary) && strlen($title)>1){
			$title = substr($title,1);
		}
		//Removes proceeding symbols
		while (in_array(substr($title,-1),$ary) && strlen($title)>1){
			$title = substr($title,0,strlen($title)-1);
		}
		if (strpos($title,'|')){
			$t = explode('|',$title);
			$title = trim($t[0]);
		}
		return $title;
	}
	
	function sqlTable($row){
		global $ary,$col;
		$str = "<tr>";
			$dex = 0;
			$bColDex = 0;
			foreach ($row AS $key=>$val){
				//Styles based on key words/characters in column name
				$style = array();
				$hide  = array();
				array_push($style,(substr($key,0,1)=='*' || substr($key,1,1)=='*')?'white-space:nowrap':'');
				//Checks if current row is the "found" row
				$find = '';
				//if (!is_null($col) && array_key_exists($key,$col)){
				if (!is_null($col)){
					if (strpos(strtolower(trim($val)),strtolower($col[$key]))!==false){
						$bColDex++;
						
						if ($bColDex==count($col)){
							$find = ($bColDex==count($col)?'data-find="true"':'');
						}
					}
					$find = 'data-find="true"';
				}
				
				//Table output
				$v = htmlspecialchars_decode(trim($val));
				$str .= "<td  style='".implode(';',array_filter($style))."' $find>".(strlen($v)==0?'&nbsp;':$v)."</td>";
				$dex++;
				unset($style,$find);
			}
		$str .= "</tr>";
		return $str;
		
		return 'in here';
	}
?>