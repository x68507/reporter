/*Provides a complete Job BOM for entered and children Jobs*/
DECLARE @JO varchar(60) SET @JO = '' 
WITH jo_tree AS(
	SELECT m.fjobno,m.fsub_from,m.fpartno,convert(varchar(255),'') indent
		, 1 AS Level, CAST(m.identity_column AS VARCHAR(255)) AS Path
		FROM jomast m
		WHERE  m.fjobno like @JO
	UNION ALL
	SELECT m.fjobno,m.fsub_from,m.fpartno,convert(varchar(255),replicate('&nbsp',4*(Level))) indent
		, Level + 1, CAST(Path + '.' + CAST(m.identity_column AS VARCHAR(255)) AS VARCHAR(255)) AS Path
		FROM jomast m
		INNER JOIN jo_tree AS c ON c.fjobno = m.fsub_from
)
SELECT 
row_number() over (order by path) 'Row#*',Level,(mm.indent+j.fbompart) '!Part | Part',i.frev 'REV',i.fdescript 'Description | Description'
,CAST(j.factqty AS decimal(8,1)) 'Qty*',j.fjobno 'JO | JO',i.fsource 'Source'

FROM jo_tree mm 
LEFT JOIN jodbom j ON mm.fjobno = j.fjobno
LEFT JOIN inmast i ON i.fpartno = j.fbompart AND i.frev = j.fbomrev
ORDER BY path
OPTION (MAXRECURSION 7)