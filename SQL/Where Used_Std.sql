/*Looks up every assembly a given part is used in based on M2M's standard BOM*/
DECLARE @Part varchar(60) SET @Part = ''
WITH cte AS(
    SELECT m.fdescript, b.fparent, b.fparentrev,  LTRIM(RTRIM(b.fcomponent)) 'fcomponent',convert(varchar(255),b.fparent) indent, b.fcomprev, b.fqty, 0 AS Level, CAST(m.identity_column AS VARCHAR(255)) AS Path
		,m.identity_column    
      FROM inboms b
      JOIN inmastx m ON m.fpartno=b.fparent AND m.frev=b.fparentrev
      WHERE b.fcomponent like @Part and b.fcomprev like (select top 1 m.frev from inmastx m where m.fpartno like @Part order by m.frevdt desc)
  UNION ALL
    SELECT m.fdescript,b.fparent, b.fparentrev, LTRIM(RTRIM(b.fcomponent)) 'fcomponent',convert(varchar(255),replicate('&nbsp',4*(Level+1)) + b.fparent) indent, b.fcomprev, b.fqty, Level + 1,CAST(Path + '.' + CAST(m.identity_column AS VARCHAR(255)) AS VARCHAR(255)) AS Path
      ,m.identity_column
		FROM inboms b
      JOIN inmastx m ON m.fpartno=b.fparent AND m.frev=b.fparentrev
      INNER JOIN cte AS c ON c.fparent = b.fcomponent AND c.fparentrev = b.fcomprev
)
SELECT DISTINCT row_number() over (order by path) 'Row#',indent '!Parent | Part',fdescript Description,fparentrev Rev, Level
FROM cte
WHERE identity_column IN (SELECT MIN(identity_column) FROM cte GROUP BY identity_column)
GROUP BY identity_column,indent,fdescript,fparentrev,Level,path
ORDER BY 'Row#'

OPTION (MAXRECURSION 10)