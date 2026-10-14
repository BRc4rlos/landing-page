// ---------------------------------------------------------------
// Configuração do formulário de contato
// ---------------------------------------------------------------
// E-mail que recebe os pedidos de orçamento. Vazio = formulário apenas demonstrativo.
// Para ativar o envio por e-mail, escreva um endereço entre aspas (ex.: "seunome@gmail.com").
var CONTACT_EMAIL = "";

// Opcional: endereço de um serviço de formulários (ex.: Formspree -> "https://formspree.io/f/xxxxxxx").
// Se estiver preenchido, o envio é feito direto pela página.
// Se estiver vazio e CONTACT_EMAIL estiver preenchido, o app de e-mail do visitante é aberto com os dados já preenchidos.
var FORM_ENDPOINT = "";

function textoSelect(select) {
  if (!select || !select.value) { return "não informado"; }
  return select.options[select.selectedIndex].text;
}

function montarMailto(form) {
  var el = form.elements;
  var tipoPessoa = el["tipo_pessoa"].value === "juridica" ? "Pessoa jurídica" :
                   el["tipo_pessoa"].value === "fisica" ? "Pessoa física" : "não informado";
  var recursos = Array.prototype.slice
    .call(form.querySelectorAll('input[name="recursos"]:checked'))
    .map(function (c) { return c.parentNode.textContent.trim(); })
    .join(", ") || "nenhum selecionado";

  var linhas = [
    "Nome completo: " + el["nome"].value,
    "Telefone: " + el["telefone"].value,
    "E-mail: " + el["email"].value,
    "Tipo de pessoa: " + tipoPessoa,
    "Melhor horário para contato: " + textoSelect(el["melhor_horario"]),
    "Data preferida para retorno: " + (el["data_preferida"].value || "não informada"),
    "Serviço desejado: " + textoSelect(el["tipo_servico"]),
    "Recursos de interesse: " + recursos,
    "",
    "Descrição do projeto:",
    el["descricao"].value
  ];

  return "mailto:" + CONTACT_EMAIL +
    "?subject=" + encodeURIComponent("Pedido de orçamento - " + el["nome"].value) +
    "&body=" + encodeURIComponent(linhas.join("\n"));
}

// ---------------------------------------------------------------
// Menu mobile, link ativo e envio do formulário
// ---------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var aberto = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", aberto ? "true" : "false");
    });

    // Fecha o menu ao clicar em um link (útil no celular)
    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Marca o link do menu correspondente à página atual
  var current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
    }
  });

  // Formulário de contato
  var form = document.querySelector("#form-contato");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var feedback = document.querySelector("#form-feedback");

      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        })
          .then(function (resposta) {
            if (!resposta.ok) { throw new Error("falha no envio"); }
            feedback.textContent = "Mensagem enviada! Retorno com a proposta em breve.";
            feedback.style.color = "#34d1a1";
            form.reset();
          })
          .catch(function () {
            feedback.textContent = "Não foi possível enviar agora. Tente novamente em instantes.";
            feedback.style.color = "#ffb454";
          });
      } else if (CONTACT_EMAIL) {
        feedback.textContent =
          "Abrindo o seu aplicativo de e-mail com os dados preenchidos — é só enviar. " +
          "Se nada abrir, escreva para " + CONTACT_EMAIL + ".";
        feedback.style.color = "#34d1a1";
        window.location.href = montarMailto(form);
      } else {
        feedback.textContent =
          "Formulário em modo demonstração: seus dados não foram enviados a ninguém. " +
          "Para falar comigo, use o GitHub: github.com/brc4rlos.";
        feedback.style.color = "#ffb454";
      }
    });
  }
});
