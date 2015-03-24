DECLARE @Part varchar(50) SET @Part =  ''
IF (LEN(@Part)>0) BEGIN
	SELECT i.fpartno '!Part | Part',i.fpartrev 'REV',i.fbinno 'Inventory',i.flocation 'Location'
	,CAST(CAST(i.fonhand AS decimal(8,1)) AS varchar(8)) 'Qty'
	
	FROM inonhd i
	WHERE i.fpartno LIKE @part
END