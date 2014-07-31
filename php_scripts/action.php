<?php
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
	}
	echo "</xml>";
?>