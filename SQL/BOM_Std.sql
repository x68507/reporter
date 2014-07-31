/*Complete Standard BOM for a given top level part number*/
DECLARE @Part varchar(60) SET @Part = '' 
WITH bom_std AS(
    SELECT b.fparent, b.fparentrev, b.fcomponent, convert(varchar(255),b.fcomponent) indent, b.fcomprev, b.fqty, 0 AS Level, CAST(b.identity_column AS VARCHAR(255)) AS Path
      ,(CASE when  b.fend_ef_dt>'1900-01-01' THEN 'Expired' ELSE 'Current' END) AS Effectivity
      ,b.fend_ef_dt
      FROM inboms b
      WHERE b.fparent like @Part and b.fparentrev like (select top 1 m.frev from inmastx m where m.fpartno like @Part order by m.frevdt desc)
		and cast(b.fend_ef_dt AS datetime) = cast('1900-01-01 00:00:00.000' AS datetime)
  UNION ALL
    SELECT b.fparent, b.fparentrev, b.fcomponent,convert(varchar(255),replicate('&nbsp',4*(Level+1)) + b.fcomponent) indent, b.fcomprev, b.fqty, Level + 1, CAST(Path + '.' + CAST(b.identity_column AS VARCHAR(255)) AS VARCHAR(255)) AS Path
      ,(CASE when  b.fend_ef_dt>'1900-01-01' THEN 'Expired' ELSE 'Current' END) AS Effectivity
      ,b.fend_ef_dt
      FROM inboms b
      INNER JOIN bom_std AS c ON b.fparent = c.fcomponent AND b.fparentrev = c.fcomprev
      where cast(b.fend_ef_dt AS datetime) = cast('1900-01-01 00:00:00.000' AS datetime) 
)
SELECT row_number() over (order by path) 'Row#',indent '!Component | Part',
Level,fcomprev Rev,CAST(fqty AS decimal(8,3)) QtyReq
,Effectivity,i.fdescript Description
FROM bom_std std
LEFT JOIN inmastx i ON std.fcomponent = i.fpartno AND std.fcomprev = i.frev
order by path 
OPTION (MAXRECURSION 7)