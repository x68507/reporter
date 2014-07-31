DECLARE @Part varchar(60) SET @Part = ''
DECLARE @Description varchar(60) SET @Description = ''
IF (LEN(@Part)>0 OR LEN(@Description)>0) BEGIN
	SELECT fpartno '!Part | Part',frev '!Rev',fdescript '!Desc. | Description',fsource 'Source',CAST(CAST(fonhand AS decimal(8,1)) AS varchar(8)) 'Inventory'
		,CAST(CAST(fonorder AS decimal(8,1)) AS varchar(8)) 'On Order',CAST(CAST(fbook AS decimal(8,1)) AS varchar(8)) 'Demand',CAST(CAST(fproqty AS decimal(8,1)) AS varchar(8)) 'WIP'
		,CONVERT(VARCHAR(10),i.flastiss,120) 'Last_Issue',CONVERT(VARCHAR(10),i.flastrcpt,120) 'Last_Receipt'
	FROM inmast i
	WHERE (i.fpartno LIKE CASE WHEN LEN(@Part)>0 THEN '%'+@Part+'%' ELSE '%' END) AND
		(i.fdescript LIKE CASE WHEN LEN(@Description)>0 THEN '%'+@Description+'%' ELSE '%' END)
	ORDER BY i.fpartno ASC,i.frevdt DESC,i.frev DESC
END