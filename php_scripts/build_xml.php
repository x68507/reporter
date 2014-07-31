<?php	
	if (strtolower(substr(php_sapi_name(),0,3))!='cli'){
		$nl = "<br>";
		$tab = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>";
		$whitelist = array('127.0.0.1','::1');

		if(!in_array($_SERVER['REMOTE_ADDR'], $whitelist)){
			die('You need to run this script via Command Line Interface (CLI).  You cannot run this script through a browser.  Open the command prompt (Windows+R->cmd->enter) and run a script similar to the one below (adjust the director for PHP.exe and the installed directory for Reporter:<br><br><div style=\'padding-left:30px;font-family:"Courier New", Courier, monospace;background:#F0F0F0\'>c:\wamp\bin\php\php5.4.16\php.exe c:\wamp\www\reporter\php_scripts\build_xml.php</div>');
		}
	}else{
		$nl = "\n";
		$tab = "\n -> ";
	}
	$path = "../SQL";
	$newFile = "../xml_tree.xml";
	
	if ($handle = opendir($path)) {
		
		$xml = "<?xml version='1.0' encoding='utf-8'?>\n";
		$xml .= "<xml>";
			while (false !== ($file = readdir($handle))) {
				if ($file != "." && $file != ".." && !is_dir($path.'/'.$file)) {
					$xml .= "<file>";
						$xml .= "<filename>".htmlspecialchars(substr($file,0,-4))."</filename>";
							$contents = file_get_contents($path.'/'.$file);
							$xml .= "<contents>".htmlspecialchars($contents)."</contents>";
							preg_match_all('/\/\*.*\*\//',$contents,$comments);

							foreach($comments[0] as $key=>$val){
								$xml .= "<comments>".htmlspecialchars($val)."</comments>";
							}

							preg_match_all('/@[A-z0-9]*(?=\s*=\s*)/',$contents,$vars);
							foreach($vars[0] as $key=>$val){
								$xml .= "<vars>".htmlspecialchars($val)."</vars>";
							}
					$xml .= "</file>";
					unset($contents);
				}
			}
			unset($file);
			closedir($handle);
		$xml .= "</xml>";
	}
	file_put_contents($newFile,$xml);
	echo 'Successfully wrote XML file...<hr>';
?>