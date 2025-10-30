=QUERY(Data!A4:Z; 
  "select Col1, Col2, Col3, Col4, Col5, Col6, Col7, Col8, Col9, Col10, Col11
    where Col13 >= " & G3 & "
    AND Col13 <= " & G5 & " " 
    & IF(ISBLANK(C7); ; "AND Col7 = '"& C7 &"' ") 
    & IF(ISBLANK(C8); ; "AND Col6 = '"& C8 &"' ") 
    & IF(ISBLANK(C9); ; "AND Col5 = '"& C9 &"' ")
;0)