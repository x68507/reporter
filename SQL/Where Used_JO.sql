/*Looks up every JO given a part was used in based on actual usage*/
DECLARE @Part varchar(60) SET @Part = ''
WITH cte AS(
		SELECT b.fjobno,m.fdescript, b.fparent, b.fparentrev, b.fbompart,convert(varchar(255),b.fparent) indent, b.fbomrev, b.factqty
		, 0 AS Level, CAST(b.identity_column AS VARCHAR(255)) AS Path
		,m.identity_column
		FROM jodbom b
		JOIN inmastx m ON m.fpartno=b.fparent AND m.frev=b.fparentrev
		WHERE b.fbompart like @Part and b.fbomrev like (select top 1 m.frev from inmastx m where m.fpartno like @Part order by m.frevdt desc)
	UNION ALL
		SELECT b.fjobno,m.fdescript,b.fparent, b.fparentrev, b.fbompart,convert(varchar(255),replicate('&nbsp',4*(Level+1)) + b.fparent) indent, b.fbomrev
		, b.factqty, Level + 1,CAST(Path + '.' + CAST(b.identity_column AS VARCHAR(255)) AS VARCHAR(255)) AS Path
		,m.identity_column
	
		FROM jodbom b
		JOIN inmastx m ON m.fpartno=b.fparent AND m.frev=b.fparentrev
		INNER JOIN cte AS c ON c.fparent = b.fbompart AND c.fparentrev = b.fbomrev
)
SELECT row_number() over (order by path) 'Row#',fjobno 'JO | JO',indent '!Component | Part',fdescript Description,fparentrev Rev, Level
FROM cte 
WHERE identity_column IN (SELECT MIN(identity_column) FROM cte GROUP BY identity_column)
GROUP BY identity_column,fjobno,indent,fdescript,fparentrev,Level,path
order by path
OPTION (MAXRECURSION 10)