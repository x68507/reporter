SELECT row_number() over (order by somast.fsono) 'Row#',somast.fsono AS SO,soitem.finumber AS LineItem,inmast.fsource AS Source, soitem.fpartno AS PartNo,soitem.fpartrev AS Rev,jomast.fsono AS JO_SO
FROM somast
LEFT JOIN jomast ON jomast.fsono = somast.fsono
LEFT JOIN soitem ON soitem.fsono = somast.fsono
LEFT JOIN inmast ON inmast.fpartno=soitem.fpartno AND inmast.frev=soitem.fpartrev
WHERE inmast.fsource='M' AND jomast.fsono IS NULL ORDER BY somast.fsono