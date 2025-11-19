document.addEventListener("DOMContentLoaded", () => {
    const { jsPDF } = window.jspdf;

    // Base64 opcional
    const logoBase64 = ""; 

    function createMealItem(plate = "", qty = "", preparation = "", substitution = "") {
        const itemDiv = document.createElement("div");
        itemDiv.className = "meal-item";
        itemDiv.innerHTML = `
            <input class="plate" type="text" placeholder="Prato / Alimento" value="${plate}">
            <input class="quantity" type="text" placeholder="Qtd (ex: 2 col.)" value="${qty}">
            <textarea class="preparation" placeholder="Modo de Preparo (Ex: Grelhado, assado...)">${preparation}</textarea>
            <textarea class="substitution" placeholder="Substituições (Ex: Trocar frango por peixe...)">${substitution}</textarea>
            <button class="btn-remove" title="Remover"><i class="fa-solid fa-trash"></i></button>
        `;
        itemDiv.querySelector(".btn-remove").addEventListener("click", () => itemDiv.remove());
        return itemDiv;
    }

    document.querySelectorAll(".items-list").forEach(list => list.appendChild(createMealItem()));
    document.querySelectorAll(".btn-add").forEach(btn => {
        btn.addEventListener("click", () => {
            const list = btn.closest(".card").querySelector(".items-list");
            list.appendChild(createMealItem());
        });
    });

    // =================================================================
    // 1. PDF
    // =================================================================
    document.getElementById("generate-pdf").addEventListener("click", async function () {
        const doc = new jsPDF('p', 'mm', 'a4');
        const secondaryColor = [107, 142, 35];
        const darkColor = [18, 56, 26];

        let headerY = 10;
        if (logoBase64) doc.addImage(logoBase64, 'PNG', 15, headerY, 25, 25);
        else {
            const logoEl = document.getElementById('logoImage');
            if (logoEl && logoEl.naturalWidth > 0) doc.addImage(logoEl, 'PNG', 15, headerY, 25, 25);
        }

        doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(...secondaryColor);
        doc.text("Plano Alimentar Personalizado", 45, headerY + 10);
        doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(60);
        doc.text("Dra. Sandrely Vitória - Nutricionista", 45, headerY + 17);
        doc.setFontSize(10); doc.text("CRN6 - 46711/P", 45, headerY + 22);
        doc.setDrawColor(...secondaryColor); doc.line(15, 40, 195, 40);

        const nome = document.getElementById("paciente-nome").value || "---";
        let dataValor = document.getElementById("data-consulta").value;
        if(dataValor) dataValor = dataValor.split('-').reverse().join('/');
        else dataValor = new Date().toLocaleDateString('pt-BR');

        doc.autoTable({
            startY: 45, theme: 'plain',
            styles: { fontSize: 11, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold', textColor: secondaryColor } },
            body: [
                ['Paciente:', nome, 'Idade:', document.getElementById("paciente-idade").value],
                ['Objetivo:', document.getElementById("paciente-objetivo").value, 'Data:', dataValor]
            ],
        });

        let finalY = doc.lastAutoTable.finalY + 10;

        document.querySelectorAll(".meal-card").forEach(card => {
            const mealTitle = card.getAttribute('data-meal');
            const mealTime = card.querySelector(".meal-time").value;
            let mealData = [];

            card.querySelectorAll(".meal-item").forEach(item => {
                const plate = item.querySelector(".plate").value.trim();
                const qty = item.querySelector(".quantity").value.trim();
                const prep = item.querySelector(".preparation").value.trim();
                const sub = item.querySelector(".substitution").value.trim();

                if (plate || qty) {
                    let content = `• ${plate} (${qty})`;
                    if(prep) content += `\n   Preparo: ${prep}`;
                    if(sub) content += `\n   Substituição: ${sub}`;
                    mealData.push([content]);
                }
            });

            if (mealData.length > 0) {
                if (finalY > 260) { doc.addPage(); finalY = 20; }
                
                doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...darkColor);
                doc.text(mealTitle, 15, finalY);
                if (mealTime) {
                    doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(100);
                    const w = doc.getStringUnitWidth(mealTitle) * 14 / doc.internal.scaleFactor;
                    doc.text(` | Horário: ${mealTime}`, 15 + w + 5, finalY);
                }
                finalY += 3;

                doc.autoTable({
                    startY: finalY, body: mealData, theme: 'grid',
                    styles: { fontSize: 10, cellPadding: 4, overflow: 'linebreak' },
                    showHead: 'never', margin: { left: 15, right: 15 }
                });
                finalY = doc.lastAutoTable.finalY + 8;
            }
        });

        // Orientações
        const orientacoes = document.getElementById("orientacoes-nutricionais").value.trim();
        if (orientacoes) {
            if (finalY > 240) { doc.addPage(); finalY = 20; }
            doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...secondaryColor);
            doc.text("Orientações Nutricionais", 15, finalY);
            finalY += 7;
            doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(50);
            const splitText = doc.splitTextToSize(orientacoes, 180);
            doc.text(splitText, 15, finalY);
            // Atualiza finalY baseado na altura do texto das orientações
            finalY += (splitText.length * 5) + 10;
        }

        // Extra (NOVO)
        const extra = document.getElementById("campo-extra").value.trim();
        if (extra) {
            if (finalY > 240) { doc.addPage(); finalY = 20; }
            doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...secondaryColor);
            doc.text("Extra", 15, finalY);
            finalY += 7;
            doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(50);
            doc.text(doc.splitTextToSize(extra, 180), 15, finalY);
        }

        // Rodapé
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i); doc.setFontSize(9); doc.setTextColor(150);
            doc.text('Dra. Sandrely Vitória • Nutrição com Amor | CRN6-46711/P', 105, 290, { align: 'center' });
        }
        doc.save(`Dieta_${nome}.pdf`);
    });

    // =================================================================
    // 2. WORD (.DOCX)
    // =================================================================
    document.getElementById("generate-word").addEventListener("click", function () {
        const { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, HeadingLevel } = docx;
        const primaryColor = "2EA86A"; 
        
        const children = [
            new Paragraph({ text: "Plano Alimentar Personalizado", heading: HeadingLevel.TITLE, alignment: "center", spacing: { after: 200 } }),
            new Paragraph({ children: [new TextRun({ text: "Dra. Sandrely Vitória - Nutricionista | CRN6-46711/P", bold: true, color: "666666" })], alignment: "center", spacing: { after: 400 } })
        ];

        const nome = document.getElementById("paciente-nome").value || "---";
        let dataValor = document.getElementById("data-consulta").value;
        if(dataValor) dataValor = dataValor.split('-').reverse().join('/');
        else dataValor = new Date().toLocaleDateString('pt-BR');

        children.push(new Paragraph({
            children: [
                new TextRun({ text: `Paciente: ${nome}`, bold: true, size: 24 }),
                new TextRun({ text: `\nIdade: ${document.getElementById("paciente-idade").value} | Data: ${dataValor}`, size: 24 }),
                new TextRun({ text: `\nObjetivo: ${document.getElementById("paciente-objetivo").value}`, size: 24 })
            ],
            spacing: { after: 400 }
        }));

        document.querySelectorAll(".meal-card").forEach(card => {
            const mealTitle = card.getAttribute('data-meal');
            const mealTime = card.querySelector(".meal-time").value;
            const items = [];
            card.querySelectorAll(".meal-item").forEach(item => {
                const plate = item.querySelector(".plate").value.trim();
                const qty = item.querySelector(".quantity").value.trim();
                const prep = item.querySelector(".preparation").value.trim();
                const sub = item.querySelector(".substitution").value.trim();
                if(plate || qty) items.push({ plate, qty, prep, sub });
            });

            if(items.length > 0) {
                children.push(new Paragraph({ children: [new TextRun({ text: `${mealTitle} ${mealTime ? ' - ' + mealTime : ''}`, bold: true, size: 28, color: primaryColor })], spacing: { before: 200, after: 100 } }));

                const tableRows = items.map(item => {
                    let cellText = [new TextRun({ text: `${item.plate} (${item.qty})`, bold: true })];
                    if(item.prep) cellText.push(new TextRun({ text: `\nPreparo: ${item.prep}`, italics: true }));
                    if(item.sub) cellText.push(new TextRun({ text: `\nSubstituição: ${item.sub}` }));

                    return new TableRow({
                        children: [ new TableCell({ children: [new Paragraph({ children: cellText })], width: { size: 100, type: WidthType.PERCENTAGE }, padding: { top: 100, bottom: 100, left: 100, right: 100 } }) ]
                    });
                });
                children.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
                children.push(new Paragraph({ text: "" }));
            }
        });

        const orientacoes = document.getElementById("orientacoes-nutricionais").value.trim();
        if (orientacoes) {
            children.push(new Paragraph({ text: "Orientações Nutricionais Gerais", heading: HeadingLevel.HEADING_2, color: primaryColor, spacing: { before: 400, after: 200 } }));
            children.push(new Paragraph({ text: orientacoes }));
        }

        // Extra (NOVO)
        const extra = document.getElementById("campo-extra").value.trim();
        if (extra) {
            children.push(new Paragraph({ text: "Extra", heading: HeadingLevel.HEADING_2, color: primaryColor, spacing: { before: 400, after: 200 } }));
            children.push(new Paragraph({ text: extra }));
        }

        const doc = new Document({ sections: [{ properties: {}, children: children }] });
        Packer.toBlob(doc).then(blob => saveAs(blob, `Dieta_${nome}.docx`));
    });
});