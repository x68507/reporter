/*Enter the current (i_cur) and ideal (i_ideal) image sizes in mm*/
/*Positive numbers are farther from the P-lens...negative numbers are closer to the P-lens*/
DECLARE @i_cur decimal(8,4) SET @i_cur =  ''
DECLARE @i_ideal decimal(8,4) SET @i_ideal =  ''
IF (LEN(@i_cur)>0 AND LEN(@i_ideal)>0) BEGIN
    SELECT replace(convert(varchar,cast(ROUND(1000000*(@i_cur-@i_ideal)/@i_cur/1.306593121,0) as money),1), '.00','') AS 'Mask-PL Dist. (um)'
	 , replace(convert(varchar,cast(ROUND((1000000*(@i_cur-@i_ideal)/@i_cur/1.306593121)/-6.23344,0) as money),1), '.00','') AS 'Sub-PL Dist. (um)'
END 