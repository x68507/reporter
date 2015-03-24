DECLARE @Part varchar(60) SET @Part = ''
DECLARE @Company varchar(60) SET @Company = ''
DECLARE @Description varchar(60) SET @Description = ''
DECLARE @OnlyOpen varchar(1) SET @OnlyOpen = '0'
IF (LEN(@Company)>0 OR LEN(@Part)>0 OR (LEN(@Company)>0 AND LEN(@Part)>0) OR (LEN(@Company)>0 AND LEN(@Description)>0)) BEGIN
	SELECT row_number() over (order by m.fstatus,m.fduedate,i.fsono,i.finumber) 'Row#',m.fsono 'SO | SO',m.fcompany Customer
	,replace(convert(varchar(10), m.fduedate, 111),'/','-')  DueDate
	,i.finumber 'Line',i.fpartno 'Part | Part',inv.fdescript 'Description | Description',i.fpartrev Rev,m.fstatus Status
	FROM somast m
	LEFT JOIN soitem i ON m.fsono=i.fsono
	left join inmastx inv ON i.fpartno = inv.fpartno AND i.fpartrev = inv.frev
	WHERE (m.fstatus = 'Open' OR @OnlyOpen=0) AND 
	((m.fcompany LIKE CASE WHEN LEN(@Company)>0 THEN '%'+@Company+'%' ELSE '%' END) AND
	(i.fpartno LIKE CASE WHEN LEN(@Part)>0 THEN '%'+@Part+'%' ELSE '%' END) AND
	(COALESCE(inv.fdescript,'') LIKE CASE WHEN LEN(@Description)>0 THEN '%'+@Description+'%' ELSE '%' END))
	ORDER BY m.fstatus,m.fduedate,i.fsono,i.finumber
END