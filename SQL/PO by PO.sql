DECLARE @PO varchar(60) SET @PO = ''
if (LEN(@PO)>0) BEGIN
	SELECT fpono 'PO',ltrim(rtrim(fpartno)) 'Part No',frev 'REV'
		,ltrim(rtrim(convert(varchar(100),fdescript))) 'Description',fvpartno 'Vendor Part No'
		,ltrim(rtrim(convert(varchar(100),fvptdes))) 'Vendor Desc.',fjokey
		,ltrim(rtrim(CONVERT(VARCHAR(10),flstpdate,120))) 'LPD'
		,cast(frcpqty AS int) 'Rec. Qty',cast(finvqty AS int) 'Inv. Qty',fcomments 'Comments'
	FROM poitem WHERE fpono LIKE @PO
END