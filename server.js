const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

// Defina a rota para servir o arquivo HTML
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/pokemon-page/:id", (req, res) => {
  res.sendFile(__dirname + "/public/pokemon.html");
});

app.get("/generate-pokemon-list", (req, res) => {
  const getPokemonUrl = (id) => `https://pokeapi.co/api/v2/pokemon/${id}`;
  const generatePokemonPromises = () =>
    Array(150)
      .fill()
      .map((_, index) =>
        axios.get(getPokemonUrl(index + 1)).then((response) => {
          if (response.status === 200 && response.data) {
            return response.data;
          } else {
            throw new Error("Resposta não contém dados válidos");
          }
        }),
      );

  const generateHTML = (pokemons) =>
    pokemons.reduce((accumulator, { name, id, types }) => {
      const elementTypes = types.map((typeInfo) => typeInfo.type.name);

      accumulator += `
        <li class="card ${
          elementTypes[0]
        }" hx-get="/modal" hx-swap="beforeend hx-target="body">
          <img class="card-image" alt="${name}" src="./assets/img/${id}.png" hx-get="/modal" hx-swap="beforeend hx-target="body"/>
          <h2 class="card-title" hx-get="/modal" hx-swap="beforeend hx-target="body">${id}. ${name}</h2>
          <p class="card-subtitle" hx-get="/modal" hx-swap="beforeend hx-target="body">${elementTypes.join(
            " | ",
          )}</p>
        </li>
      `;
      return accumulator;
    }, "");
  const pokemonPromises = generatePokemonPromises();

  Promise.all(pokemonPromises)
    .then(generateHTML)
    .then((html) => {
      res.send(html); //retorna o HTML gerado como
    })
    .catch((error) => {
      console.error("Erro ao gerar HTML:", error);
      res.status(500).send("Erro interno do servidor");
    });
});

app.get("/pokemon/:id", (req, res) => {
  const id = req.params.id;
  const getPokemonById = (id) => {
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${id}`;
    return axios.get(apiUrl).then((response) => {
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        throw new Error("Resposta não contém dados válidos");
      }
    });
  };
  res.send(`Pokemon ${id}`);
});

app.get("/modal", (req, res) => {
  const modalType = req.query.type || "default";
  const modalTitle = req.query.title || "Meu Modal";

  // Realize qualquer lógica necessária com base nos parâmetros

  // Envie uma resposta com informações do modal
  const modalInfo = {
    name: modalType,
    description: modalTitle,
    // Outros dados relevantes para o modal
  };

  res.json(modalInfo);
});

// Rota para fechar o modal
app.get("/close-modal", (req, res) => {
  // Você pode enviar uma resposta vazia ou outra resposta apropriada para fechar o modal.
  // Por exemplo, aqui enviamos uma mensagem simples.
  res.send("Fechar");
});
// Outras rotas e lógica do backend podem ser definidas aqui

app.listen(port, () => {
  console.log(`Servidor backend está rodando na porta ${port}`);
});
