/*Stanard Routing: NOTE JOB ROUTING COULD DIFFER*/
/*Keep "REV" blank for the lastest revision or enter a revision for a specific search*/
DECLARE @Part varchar(50) SET @Part =  ''
DECLARE @REV varchar(3) SET @REV =  ''
IF (LEN(@Part)>0) BEGIN
	SELECT fpartno'!Component | Part',fcpartrev 'REV',foperno 'OpNo',fpro_id 'WorkCenter',fopermemo 'Notes'
	FROM inrtgs 
	WHERE fpartno LIKE @Part AND fcpartrev LIKE CASE WHEN LEN(@REV)>0 THEN @REV ELSE (select top 1 m.frev from inmastx m where m.fpartno like @Part order by m.frevdt desc,m.frev desc) END
END