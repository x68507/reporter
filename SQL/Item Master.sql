/*son of a gun*/
DECLARE @Part varchar(60) SET @Part =    ''
DECLARE @Description varchar(60) SET @Description =    ''
DECLARE @SAP varchar(60) SET @SAP =    ''
IF (LEN(@Part)>0 OR LEN(@Description)>0 OR LEN(@SAP)>0) BEGIN
	SELECT fpartno '!Part | Part',frev '!Rev',fdescript '!Desc. | Description',fsource 'Source',CAST(CAST(fonhand AS decimal(8,1)) AS varchar(8)) 'Inventory'
		,CAST(CAST(fonorder AS decimal(8,1)) AS varchar(8)) 'OnOrder',CAST(CAST(fbook AS decimal(8,1)) AS varchar(8)) 'Demand',CAST(CAST(fproqty AS decimal(8,1)) AS varchar(8)) 'WIP'
		,CONVERT(VARCHAR(10),i.flastiss,120) 'Last_Issue',CONVERT(VARCHAR(10),i.flastrcpt,120) 'Last_Receipt'
		,replace(fcusrchr3,'[SN]','') 'SAP'
	FROM inmast i
	WHERE (len(@Part)>0 AND @Part!='%' AND i.fpartno LIKE '%'+@Part+'%')
		OR (len(@Description)>0 AND @Description!='%' AND i.fdescript LIKE '%'+@Description+'%')
		OR (len(@SAP)>0 AND @SAP!='%' AND i.fcusrchr3 LIKE '%'+@SAP+'%')
		OR (@SAP='%' AND len(i.fcusrchr3)>0 AND i.fcusrchr3!='[SN]')
	ORDER BY i.fpartno ASC,i.frevdt DESC,i.frev DESC
END