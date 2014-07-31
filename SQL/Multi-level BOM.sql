/*For a given part number, provides an indented BOM with Material Availability, Open JO's and Open PO's*/
DECLARE @Part varchar(60) SET @Part = '' 
WITH cte AS(
    SELECT m.fdescript, b.fparent, b.fparentrev, b.fcomponent,convert(varchar(255),b.fcomponent) indent, b.fcomprev, b.fqty, 0 AS Level, CAST(b.identity_column AS VARCHAR(255)) AS Path
      ,m.fonhand,m.fonorder,m.fqtyinspec,m.fproqty,m.fbook,m.fnonnetqty,m.fsource
      ,(CASE when  b.fend_ef_dt>'1900-01-01' THEN 'Expired' ELSE 'Current' END) AS Effectivity
      ,STUFF((SELECT '<br>' + fjobno + ' (' + cast(cast(fquantity as int) as varchar) +')'  + ' [' + CONVERT(varchar(10),fddue_date,126) +']'  FROM jomast WHERE fpartno LIKE b.fcomponent AND fpartrev LIKE b.fcomprev AND (fstatus!='CANCELLED' AND fstatus!='CLOSED' AND fstatus!='COMPLETED') FOR XML PATH ('')), 1, 10, '') JO
      ,b.fend_ef_dt
      FROM inboms b
      JOIN inmast m ON m.fpartno=b.fcomponent AND m.frev=b.fcomprev
      WHERE b.fparent like @Part and b.fparentrev like (select top 1 m.frev from inmast m where m.fpartno like @Part order by m.frevdt desc)
      and cast(b.fend_ef_dt AS datetime) = cast('1900-01-01 00:00:00.000' AS datetime)
  UNION ALL
    SELECT m.fdescript,b.fparent, b.fparentrev, b.fcomponent,convert(varchar(255),replicate('&nbsp',4*(Level+1)) + b.fcomponent) indent, b.fcomprev, b.fqty, Level + 1, CAST(Path + '.' + CAST(b.identity_column AS VARCHAR(255)) AS VARCHAR(255)) AS Path
      ,m.fonhand,m.fonorder,m.fqtyinspec,m.fproqty,m.fbook,m.fnonnetqty,m.fsource
      ,(CASE when  b.fend_ef_dt>'1900-01-01' THEN 'Expired' ELSE 'Current' END) AS Effectivity
      ,STUFF((SELECT '<br>' + fjobno + ' (' + cast(cast(fquantity as int) as varchar) +')'  + ' [' + CONVERT(varchar(10),fddue_date,126) +']'  FROM jomast WHERE fpartno LIKE b.fcomponent AND fpartrev LIKE b.fcomprev AND (fstatus!='CANCELLED' AND fstatus!='CLOSED' AND fstatus!='COMPLETED') FOR XML PATH ('')), 1, 10, '') JO
      ,b.fend_ef_dt
      FROM inboms b
      JOIN inmast m ON m.fpartno=b.fcomponent AND m.frev=b.fcomprev
      INNER JOIN cte AS c ON b.fparent = c.fcomponent AND b.fparentrev = c.fcomprev
      where cast(b.fend_ef_dt AS datetime) = cast('1900-01-01 00:00:00.000' AS datetime) 
)
SELECT 
row_number() over (order by path) 'Row#*',indent '!*Component | Part',fcomprev Rev,fdescript 'Description | Description', CAST(fqty AS decimal(8,1)) 'QtyReq*',fsource Source, Level 'Level*',CAST(fonhand AS int) 'Inventory*'
,CAST(fonorder AS int) 'OnOrder*',CAST(fproqty AS int) 'WIP*',CAST(fbook AS int) 'Demand*'
,CAST((fonhand+fonorder+fqtyinspec+fproqty-fbook-fnonnetqty) AS int) 'Available*',JO '*JO'
,STUFF((SELECT '<br>' + i.fpono +'-'+rtrim(ltrim(i.fitemno)) +' ('+cast(cast(i.fordqty as int) - cast(i.frcpqty as int) as varchar) +') [' + CONVERT(varchar(10),i.flstpdate,126) +']'  FROM poitem i 
inner join pomast m on i.fpono=m.fpono WHERE i.fpartno LIKE ('SUB-'+rtrim(ltrim(fcomponent))) AND i.frev LIKE fcomprev  AND (fstatus!='CANCELLED' AND fstatus!='CLOSED') ORDER BY i.flstpdate FOR XML PATH ('')), 1, 10, '') '*PO-LI'
FROM cte order by path 
OPTION (MAXRECURSION 7)