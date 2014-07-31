SET @Last_Name = '',@Second = '';
SELECT ID ,First '!First' ,Last,Email  FROM tbl_users 

WHERE LENGTH(@Last_Name)>0 AND Last LIKE CONCAT('%',@Last_Name,'%')