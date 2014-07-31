DECLARE @Part varchar(60) SET @Part = ''
SELECT fparent Parent,fparentrev pRev,fcomponent Component,fcomprev cRev,fdescript Description,fqty Qty,fbommemo Memo
from inboms
left join inmastx ON inboms.fcomponent=inmastx.fpartno AND inboms.fcomprev=inmastx.frev
where fparent like @Part
and fparentrev like (select top 1 frev from inmastx where fpartno like @Part order by frevdt desc)
AND fend_ef_dt='1900-01-01'
order by fparent,fparentrev desc,fcomponent,fcomprev