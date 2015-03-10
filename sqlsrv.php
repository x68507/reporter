<!doctype html>
<html data-type='mssql'>
	<head>
		
		<!--disables cahce (PIMA on IE)-->
		<meta http-equiv="cache-control" content="max-age=0" />
		<meta http-equiv="cache-control" content="no-cache" />
		<meta http-equiv="expires" content="0" />
		<meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
		<meta http-equiv="pragma" content="no-cache" />
		
		
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<!--diable compatibility mode which is f-ing up the scripts-->
		<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE10" />
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<!--jQuery-->
		<script type='text/javascript' src='extensions/jQuery.js'></script>
		<link rel="icon" href="../images/mysql.png" type="image/x-icon">
		
		<!--Custom Scripts-->
		<link type='text/css' rel='stylesheet' href='stylesheet.css?v=1'/>
		<script type='text/javascript' src='jscript.js?v=0.01'></script>
		
		<!--Extensions-->
		<script src="extensions/ace/src-min-noconflict/ace.js" type="text/javascript" charset="utf-8"></script>
		<script src="extensions/ace/src-min-noconflict/ext-language_tools.js"></script>
		<link href="extensions/FooTable/css/footable.core.min.css" rel="stylesheet" type="text/css" />
		<link href="extensions/FooTable/css/footable.standalone.min.css" rel="stylesheet" type="text/css" />
		<script src="extensions/FooTable/js/footable.js" type="text/javascript"></script>
		<script src="extensions/FooTable/js/footable.sort.js" type="text/javascript"></script>
		<script src="extensions/FooTable/js/footable.filter.js" type="text/javascript"></script>
		<script src="extensions/FooTable/js/footable.striping.js" type="text/javascript"></script>
		<script src="extensions/fixed_header/jquery.fixedheadertable.min.js" type="text/javascript"></script>
		<link href="extensions/fixed_header/css/defaultTheme.css" rel="stylesheet" type="text/css" />
		<script src="extensions/zeroclipboard/dist/ZeroClipboard.js"></script>
		
		<script type='text/javascript' src='extensions/table2csv.js'></script>
	</head>
	<body>
		<div id='login'>Password: <input id='password' type='password' autocomplete='off'><input type='button' class='hover blue btr btl bbr bbl' Value='Submit' onclick='lsub()'><input type='button' class='ml hover gray btr btl bbr bbl' Value='Cancel' onclick='$("#click").click()'></div>
		<?php
			
			//$ping = 'pong';
			//include_once('../config.php');
		
			echo "<div id='top'>";
				echo "<div class='mh'>";
					if (isset($_COOKIE['sql_user']) && $_COOKIE['sql_user']=='true'){
						$str = 'Logout';
						$temp = "onclick='sqlToggle()'";
					}else{
						$temp = "style='visibility:hidden'";
						$str = 'Login';
					}
					echo "<div id='nav-container'>";
						
					echo "</div>";
					//echo "<input id='ll' type='button' Value='".$str."' onclick='login()' >";
					//
					echo "<div id='sql' class='h'>";
					
					echo "<div id='sqltitle'>--</div>";
					echo "<div id='sqltext'></div>";
					echo "<input type='button' value='Clear' onclick='fncClear()' class='hover gray btr btl bbr bbl'>";
					echo "<span class='mh rhn'>";
						echo "<input type='button' id='sqldel' class='hover gray btr btl bbr bbl h sqlt' Value='Delete' onclick='sqlDel()'>";
						echo "<span style='padding:0 20px'>&nbsp;</span>";
						echo "<input type='button' id='sqlnew' class='hover gray btr btl bbr bbl h sqlt' Value='New' onclick='sqlNew()'>";
						echo "<input type='button' id='sqlsave' class='hover gray btr btl bbr bbl h sqlt ml' Value='Save' onclick='sqlSave()'>";
					echo "</span>";
					echo "<hr id='hr-resize' class='mh'>";
				echo "</div>";
			echo "</div>";
			echo "<div style='position:relative;width:100%;'>";
				echo "<span class='mh rhn'>";
					echo "<input type='button' id='sqltoggle' class='hover gray btr btl bbr bbl' $temp Value='SQL Toggle'>";
					echo "<input id='ll' class='hover gray btr btl bbr bbl ml' type='button' Value='".$str."' onclick='login()' >";
					include('../nav.php');
				echo "</span>";
				
				echo "<div class='mobile'>";
					
					echo "<input id='b-execute' type='button' Value='Execute' class='hover blue btr btl bbr bbl' onclick='run()'>";
					echo "<select id='selquery' class='ml' onchange='userQuery(this)'>";
						echo "<option>--</option>";
						$str = substr($_SERVER['SCRIPT_FILENAME'],0,strrpos($_SERVER['SCRIPT_FILENAME'],'/')).'/SQL/';

						$dir = new DirectoryIterator($str);
						foreach ($dir as $fileinfo) {
							if (!$fileinfo->isDot() && $fileinfo->isFile()) {
								echo "<option data-type='data'>".substr($fileinfo->getFilename(),0,strpos($fileinfo->getFilename(),'.'))."</option>";
							}
						}
						
					echo "</select><input id='b-clear' type='button' Value='Clear' class='ml mh hover gray btr btl bbr bbl'></div>";
					echo "<div id='vars'></div>";
					echo "<div id='comments'></div>";
					echo "<hr>";
				echo "</div>";
				echo "<div id='init-hide'>";
					echo "<div id='export' class='mh'>";
						echo "<input type='button' class='hover gray btr btl bbr bbl ml' onclick='csvExport()' Value='Export'>";
					echo "</div>";
					echo "<div class='mobile foofilter'>";
						echo "<span>Filter: </span><input id='filter' type='text' title='Press Ctrl+Shift+? for help'/><span id='filtered-number'></span>";
					echo "</div>";
					echo "<div id='togrow' class='mh'>";
						echo "<span id='togrow-num'></span><input type='button' class='hover gray btr btl bbr bbl ml' value='Toggle Highlights' onclick='return toggleRow();' title='Click to only show highlighted; Ctrl+Click to hide highlighted'>";
					echo "</div>";
				echo "</div>";
			echo "</div>";
			echo "<div id='content-main'></div>";			
		?>
	</body>
</html>

