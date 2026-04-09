import{E as _}from"./jspdf.es.min-BDGKOpgd.js";function i(a,t){const e=new _;e.setFontSize(18),e.text("INSTITUTO SUPERIOR ISIPP",105,30,{align:"center"}),e.setFontSize(16),e.text("CONSTANCIA DE ALUMNO REGULAR",105,45,{align:"center"}),e.setFontSize(12);const n=`
Se deja constancia que el/la estudiante:

${a.first_name} ${a.last_name}
DNI: ${a.dni}

es alumno/a regular de la carrera:

${t.name}

durante el ciclo lectivo ${new Date().getFullYear()}.

Se extiende la presente constancia a pedido del interesado
para los fines que estime corresponder.
`;e.text(n,20,70),e.text("_________________________",105,150,{align:"center"}),e.text("Secretaría Académica",105,160,{align:"center"}),e.save(`constancia_regular_${a.last_name}.pdf`)}export{i as g};
