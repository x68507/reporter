DECLARE @Part varchar(60) SET @Part = ''
DECLARE @JO varchar(60)
IF (LEN(@Part)>0) BEGIN
	SELECT m.fpartno 'Part',m.fpartrev 'REV',m.fstatus 'Status', m.fjobno '!Job No',id.fdescmemo 'Memo'
		,CONVERT(VARCHAR(10),m.fact_rel,120) 'Release Date'
		,CONVERT(VARCHAR(10),m.ftrave_dt,120) 'Last Move Date'
		FROM joitemdesc id
		LEFT JOIN jomast m ON id.fjobno = m.fjobno
		WHERE (id.fdescmemo LIKE 'S/N %' OR id.fdescmemo LIKE '[[]SN%]') AND m.fpartno LIKE @Part
		ORDER BY cast(id.fdescmemo as varchar(1000))
END