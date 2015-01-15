DECLARE @Part varchar(60) SET @Part = ''
DECLARE @Company varchar(60) SET @Company = ''
DECLARE @PO varchar(10) SET @PO = ''
DECLARE @OnlyOpen varchar(1) SET @OnlyOpen= '1'
if (LEN(@Part)>0 OR LEN(@Company)>0 OR LEN(@PO)>3) BEGIN
	SELECT row_number() over (order by m.fcompany,m.forddate,i.flstpdate) 'Row'
	,m.fpono PO,m.fcompany '!Company',m.fvendno 'Vendor'
	,CONVERT(VARCHAR(10),m.forddate,120) '*Order_Date'
	,CASE WHEN i.frcpdate = '1900-01-01' THEN '' ELSE CONVERT(VARCHAR(10),i.frcpdate,120) END '*Received'
	,CAST(i.fordqty AS decimal(8,1)) 'Qty',m.fstatus 'Status'
	,ltrim(rtrim(i.fpartno)) '!Part | Part',ltrim(rtrim(i.frev)) 'REV',ltrim(rtrim(convert(varchar(100),i.fdescript))) 'Description | Description',i.fitemno 'Item_No'
	,CASE WHEN i.flstpdate = '1900-01-01' THEN '' ELSE CONVERT(VARCHAR(10),i.flstpdate,120) END '*LPD'
	,CAST(i.fordqty AS decimal(8,1)) 'OrderQty'
	,'$'+convert(varchar(50), CAST(i.fucostonly as money), -1) 'Unit_Cost'
	FROM pomast m
	LEFT JOIN poitem i ON m.fpono = i.fpono
	WHERE (m.fstatus = 'OPEN' OR m.fstatus='STARTED' OR @OnlyOpen=0) AND 
		((i.fpartno LIKE CASE WHEN LEN(@Part)>0 THEN '%'+@Part+'%' ELSE '%' END) AND
		(m.fcompany LIKE CASE WHEN LEN(@Company)>0 THEN '%'+@Company+'%' ELSE '%' END) AND
		(i.fpono LIKE CASE WHEN LEN(@PO)>3 THEN '%'+@PO+'%' ELSE '%' END))
	ORDER BY m.fcompany,m.forddate,i.flstpdate
END