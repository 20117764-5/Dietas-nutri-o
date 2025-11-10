document.addEventListener("DOMContentLoaded", () => {
    // ======== FUNÇÃO PARA CRIAR NOVO ALIMENTO ========
    function createMealItem(foodValue = "", qtyValue = "") {
      const itemDiv = document.createElement("div");
      itemDiv.className = "meal-item";
      itemDiv.innerHTML = `
        <input class="food" type="text" placeholder="Alimento" value="${foodValue}">
        <input class="quantity" type="text" placeholder="Quantidade" value="${qtyValue}">
      `;
      return itemDiv;
    }
  
    // inicializa as refeições
    document.querySelectorAll(".meal").forEach(meal => {
      const items = meal.querySelector(".items");
      if (!items.querySelector(".meal-item")) {
        items.appendChild(createMealItem());
      }
    });
  
    // evento dos botões "+ adicionar alimento"
    document.querySelectorAll(".add-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const items = btn.previousElementSibling;
        items.appendChild(createMealItem());
      });
    });
  
    // ======== GERAR PDF ========
    document.getElementById("generate-pdf").addEventListener("click", async function () {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
  
      // === CONFIGURAÇÕES ===
      const verdeMusgo = [51, 77, 61];
      const verdeClaro = [232, 242, 235];
      const margemEsq = 20;
      let y = 20;
  
      // === LOGO E CABEÇALHO ===
      try {
        const logoEl = document.querySelector(".logo img");
        if (logoEl) {
          const canvas = document.createElement("canvas");
          canvas.width = logoEl.width;
          canvas.height = logoEl.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(logoEl, 0, 0);
          const logoBase64 = canvas.toDataURL("image/png");
          doc.addImage(logoBase64, "PNG", margemEsq, y, 25, 25);
        }
      } catch {}
  
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...verdeMusgo);
      doc.text("Plano Alimentar", 55, y + 8);
  
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Dra. Sandrely Vitória - Nutricionista", 55, y + 15);
      doc.text("CRN6 - 46711/P", 55, y + 21);
  
      // Linha verde
      y += 30;
      doc.setDrawColor(...verdeMusgo);
      doc.setLineWidth(0.8);
      doc.line(margemEsq, y, 190, y);
  
      // === DADOS DO PACIENTE ===
      y += 10;
      doc.setFillColor(...verdeClaro);
      doc.roundedRect(margemEsq, y, 170, 30, 3, 3, "F");
  
      const nome = document.getElementById("nome")?.value || "";
      const idade = document.getElementById("idade")?.value || "";
      const objetivo = document.getElementById("objetivo")?.value || "";
      const dataConsulta = document.getElementById("dataConsulta")?.value || "";
  
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...verdeMusgo);
      doc.text("Dados do Paciente", margemEsq + 4, y + 7);
  
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.text(`Nome: ${nome}`, margemEsq + 4, y + 14);
      doc.text(`Idade: ${idade}`, margemEsq + 100, y + 14);
      doc.text(`Objetivo: ${objetivo}`, margemEsq + 4, y + 21);
      doc.text(`Data: ${dataConsulta}`, margemEsq + 100, y + 21);
      y += 40;
  
      // === REFEIÇÕES ===
      const meals = document.querySelectorAll(".meal");
      meals.forEach(meal => {
        const title = meal.querySelector("h3").textContent;
        const items = meal.querySelectorAll(".meal-item");
  
        // Caixa de refeição
        doc.setFillColor(...verdeClaro);
        const startY = y;
        let boxHeight = 15 + items.length * 6.5;
        if (boxHeight < 25) boxHeight = 25;
        doc.roundedRect(margemEsq, y, 170, boxHeight, 3, 3, "F");
  
        // Título
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...verdeMusgo);
        doc.text(title, margemEsq + 4, y + 8);
  
        // Cabeçalho da tabela
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60);
        doc.text("Alimento", margemEsq + 4, y + 14);
        doc.text("Quantidade", 130, y + 14);
  
        // Itens
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        let lineY = y + 20;
        items.forEach(item => {
          const food = item.querySelector(".food").value.trim();
          const qty = item.querySelector(".quantity").value.trim();
          if (food || qty) {
            doc.text(food, margemEsq + 4, lineY);
            doc.text(qty, 130, lineY);
            lineY += 6;
          }
        });
  
        y += boxHeight + 8;
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
      });
  
      // === RODAPÉ ===
      doc.setFontSize(9);
      doc.setTextColor(130);
      doc.text("© Dra. Sandrely Vitória - Nutricionista CRN6-46711/P", margemEsq, 285);
  
      doc.save(`Plano_Alimentar_${nome || "Paciente"}.pdf`);
    });
  });
  