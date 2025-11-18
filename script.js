document.addEventListener("DOMContentLoaded", () => {
  const { jsPDF } = window.jspdf;

  // --- Função para criar linha de alimento ---
  function createMealItem(foodValue = "", qtyValue = "") {
      const itemDiv = document.createElement("div");
      itemDiv.className = "meal-item";
      itemDiv.innerHTML = `
          <input class="food" type="text" placeholder="Ex: Pão integral com ovo" value="${foodValue}">
          <input class="quantity" type="text" placeholder="Ex: 2 fatias" value="${qtyValue}">
          <button class="btn-remove" title="Remover"><i class="fa-solid fa-trash"></i></button>
      `;

      // Evento para remover o item
      itemDiv.querySelector(".btn-remove").addEventListener("click", () => {
          itemDiv.remove();
      });

      return itemDiv;
  }

  // --- Inicializa com 1 item vazio em cada refeição ---
  document.querySelectorAll(".items-list").forEach(list => {
      list.appendChild(createMealItem());
  });

  // --- Botões de Adicionar (+) ---
  document.querySelectorAll(".btn-add").forEach(btn => {
      btn.addEventListener("click", () => {
          // Encontra a div 'items-list' dentro do mesmo card
          const card = btn.closest(".card");
          const list = card.querySelector(".items-list");
          list.appendChild(createMealItem());
      });
  });

  // --- GERAÇÃO DO PDF ---
  document.getElementById("generate-pdf").addEventListener("click", async function () {
      const doc = new jsPDF();
      
      // Cores da marca
      const primaryColor = [46, 168, 106]; // Verde Claro
      const secondaryColor = [107, 142, 35]; // Verde Musgo
      const darkColor = [18, 56, 26]; // Verde Escuro

      // 1. Header com Logo
      try {
          const logoImg = document.getElementById('logoImage');
          // Cria um canvas para converter a imagem em base64 se necessário, 
          // ou usa addImage direto se a imagem estiver carregada localmente.
          // Aqui assumimos que Assets/LOGO.png carrega corretamente.
          doc.addImage(logoImg, 'PNG', 15, 10, 25, 25);
      } catch (e) {
          console.log("Erro ao carregar logo", e);
      }

      // Texto do Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...secondaryColor);
      doc.text("Plano Alimentar Personalizado", 45, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text("Dra. Sandrely Vitória - Nutricionista", 45, 27);
      doc.setFontSize(10);
      doc.text("CRN6 - 46711/P", 45, 32);

      doc.setDrawColor(...secondaryColor);
      doc.setLineWidth(0.5);
      doc.line(15, 40, 195, 40);

      // 2. Informações do Paciente
      const nome = document.getElementById("paciente-nome").value || "---";
      const idade = document.getElementById("paciente-idade").value || "---";
      const data = document.getElementById("data-consulta").value || new Date().toLocaleDateString('pt-BR');
      const objetivo = document.getElementById("paciente-objetivo").value || "---";

      doc.autoTable({
          startY: 45,
          theme: 'plain',
          styles: { fontSize: 11, cellPadding: 2 },
          columnStyles: { 0: { fontStyle: 'bold', textColor: secondaryColor } },
          body: [
              ['Paciente:', nome, 'Idade:', idade],
              ['Objetivo:', objetivo, 'Data:', data]
          ],
      });

      let finalY = doc.lastAutoTable.finalY + 10;

      // 3. Loop pelas refeições
      const mealCards = document.querySelectorAll(".meal-card");

      mealCards.forEach(card => {
          const title = card.querySelector("h3").innerText;
          const items = [];
          
          // Pega os inputs
          card.querySelectorAll(".meal-item").forEach(item => {
              const food = item.querySelector(".food").value;
              const qty = item.querySelector(".quantity").value;
              
              if (food.trim() !== "") {
                  items.push([food, qty]);
              }
          });

          // Só gera a tabela se tiver itens na refeição
          if (items.length > 0) {
              
              // Título da Refeição
              doc.setFont("helvetica", "bold");
              doc.setFontSize(13);
              doc.setTextColor(...darkColor);
              // Verifica se cabe na página
              if (finalY > 270) { doc.addPage(); finalY = 20; }
              
              doc.text(title, 15, finalY);
              finalY += 3;

              // Tabela de Alimentos
              doc.autoTable({
                  startY: finalY,
                  head: [['Alimento / Preparação', 'Quantidade / Medida Caseira']],
                  body: items,
                  theme: 'striped',
                  headStyles: { fillColor: secondaryColor, textColor: [255,255,255], fontStyle: 'bold' },
                  bodyStyles: { textColor: [50,50,50] },
                  styles: { fontSize: 11, cellPadding: 4 },
                  margin: { left: 15, right: 15 },
                  columnStyles: { 
                      0: { cellWidth: 120 },
                      1: { cellWidth: 'auto' } 
                  }
              });

              finalY = doc.lastAutoTable.finalY + 10;
          }
      });

      // Rodapé
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(9);
          doc.setTextColor(150);
          doc.text('Dra. Sandrely Vitória • Nutrição com Amor', 105, 290, { align: 'center' });
      }

      // Salvar
      const fileName = `Dieta_${nome.replace(/ /g, "_")}.pdf`;
      doc.save(fileName);
  });
});