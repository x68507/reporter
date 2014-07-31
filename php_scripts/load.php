<?php	
	$file = $_POST['file'];

	echo "<?xml version='1.0' encoding='utf-8'?>\n";
	echo "<xml_data>";
	
		switch($_POST['type']){
			case 'sql':
				echo "<file><![CDATA[".file_get_contents('../SQL/'.$file.'.sql',FILE_USE_INCLUDE_PATH)."]]></file>";
				break;
			case 'help':
				echo "<file><![CDATA[".file_get_contents('../help.txt',FILE_USE_INCLUDE_PATH)."]]></file>";
				break;
		}
		
	
	echo "</xml_data>";
?>