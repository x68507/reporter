DECLARE @Part varchar(60) SET @Part = ''
DECLARE @JO varchar(15) SET @JO = ''
DECLARE @OnlyOpen varchar(1) SET @OnlyOpen = '1'
if (LEN(@Part)>0 OR LEN(@JO)>0) BEGIN
	SELECT fpartno '!*Part | Part',fjobno '!*JO | JO',fpartrev 'Rev',fsono 'SO',fstatus 'Status',fcompany 'Company',fjob_name 'JO_Name',fsub_from '*JO_From'
		,CONVERT(VARCHAR(10),fddue_date,120) '*Due_Date',CONVERT(VARCHAR(10),fopen_dt,120) '*Open_Date'
		,CONVERT(VARCHAR(10),fact_rel,120) '*Rel_Date'
		,CASE WHEN flastlab = '1900-01-01' THEN '' ELSE CONVERT(VARCHAR(10),flastlab,120) END '*Last_Labor'
		
	FROM jomast m 
	WHERE (m.fstatus = 'OPEN' OR m.fstatus='RELEASED' OR m.fstatus='STARTED' OR @OnlyOpen=0) AND
		((m.fpartno LIKE CASE WHEN LEN(@Part)>0 THEN '%'+@Part+'%' ELSE '%' END) AND
		(m.fjobno LIKE CASE WHEN LEN(@JO)>0 THEN '%'+@JO+'%' ELSE '%' END))
	ORDER BY m.fpartno,m.fjobno
END