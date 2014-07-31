DECLARE @Part varchar(60) SET @Part = ''
DECLARE @SN varchar(60) SET @SN = ''
DECLARE @JO varchar(60)
IF (LEN(@SN)>0 AND LEN(@Part)>0) BEGIN
	SET @JO = (SELECT b.fjobno 
		FROM jodbom b
		WHERE (b.fstdmemo LIKE 'S/N '+@SN+'%' OR b.fstdmemo LIKE '[[]SN '+@SN+']') AND b.fbompart LIKE @Part)
	SELECT jm.fpartno 'Parent',jm.fpartrev 'Parent REV','-' 'Part','-' 'REV',im.fdescript 'Description',d.fdescmemo 'Memo','-' 'Matl. Cost'
		,'-' 'Qty',d.fjobno 'Job No'
		,CONVERT(VARCHAR(10),jm.fact_rel,120) 'Release Date'
		,(SELECT TOP 1 CONVERT(VARCHAR(10),fneed_dt,120) FROM jodbom WHERE fjobno LIKE @JO) 'Need By Date'
		,jm.fstatus 'Status' 
		FROM joitemdesc d
		LEFT JOIN jomast jm ON d.fjobno = jm.fjobno
		LEFT JOIN inmast im ON jm.fpartno = im.fpartno AND jm.fpartrev = im.frev
		where jm.fjobno like @JO
	UNION ALL
	SELECT '-' Parent,i.fparentrev 'Parent REV',i.fbompart 'Part',i.fbomrev REV,i.fbomdesc Description,i.fstdmemo 'Memo'
		,'$'+CONVERT(VARCHAR(12),cast(i.fmatlcost as money),1) AS 'Matl. Cost'
		,reverse(stuff(reverse(convert(varchar(12),CAST(i.factqty as money),1)),1,1,'')) Qty
		,i.fjobno 'Job No'
		,'-' 'Release Date'
		,'-' 'Need By Date'
		,'-' 'Status'
		FROM jodbom i
		LEFT JOIN jomast m ON i.fjobno=m.fjobno
		WHERE (i.fstdmemo LIKE 'S/N%' OR i.fstdmemo LIKE '[[]SN%]') AND i.fjobno LIKE @jo
END