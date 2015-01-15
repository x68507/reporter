DECLARE @Part varchar(60) SET @Part =  ''
DECLARE @REV varchar(3) SET @REV =  ''
if (LEN(@Part)>0) BEGIN
    SELECT fparent Parent,fparentrev pRev,fcomponent Component,fcomprev cRev,fdescript Description,fqty Qty,fbommemo Memo
    from inboms
    left join inmastx ON inboms.fcomponent=inmastx.fpartno AND inboms.fcomprev=inmastx.frev
    where fparent like @Part
    and fparentrev like CASE WHEN LEN(@REV)>0 THEN @REV ELSE (select top 1 m.frev from inmastx m where m.fpartno like @Part order by m.frevdt desc) END
    AND fend_ef_dt='1900-01-01'
    order by fparent,fparentrev desc,fcomponent,fcomprev
END