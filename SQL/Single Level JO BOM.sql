DECLARE @JO varchar(60) SET @JO=''
select fitem,fbompart,fbomrev,fbomdesc,factqty from jodbom where fjobno like '%'+@JO+'%'