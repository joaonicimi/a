const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const pessoas = [];
const passaportes = [];
let proximoIdPessoa = 1;
let proximoIdPassaporte = 1;

function dataValida(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  const data = new Date(`${valor}T00:00:00.000Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor;
}

function camposPessoaValidos(dados) {
  return (
    dados &&
    typeof dados.nome === "string" &&
    dados.nome.trim() &&
    typeof dados.cpf === "string" &&
    dados.cpf.trim() &&
    dataValida(dados.dataNascimento)
  );
}

function camposPassaporteValidos(dados) {
  return (
    dados &&
    typeof dados.numero === "string" &&
    dados.numero.trim() &&
    dataValida(dados.dataEmissao) &&
    dataValida(dados.dataValidade) &&
    Number.isInteger(Number(dados.idPessoa)) &&
    Number(dados.idPessoa) > 0
  );
}

function idDaRota(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

app.get("/", (req, res) => {
  res.json({ mensagem: "API de pessoas e passaportes funcionando." });
});

app.post("/pessoas", (req, res) => {
  if (!camposPessoaValidos(req.body)) {
    return res.status(400).json({
      erro: "Informe nome, CPF e dataNascimento válida (AAAA-MM-DD).",
    });
  }

  const pessoa = {
    id: proximoIdPessoa++,
    nome: req.body.nome.trim(),
    cpf: req.body.cpf.trim(),
    dataNascimento: req.body.dataNascimento,
  };

  pessoas.push(pessoa);
  return res.status(201).json({ mensagem: "Pessoa cadastrada.", pessoa });
});

app.get("/pessoas", (req, res) => {
  res.json(pessoas);
});

app.get("/pessoas/:id", (req, res) => {
  const id = idDaRota(req.params.id);
  const pessoa = pessoas.find((item) => item.id === id);

  if (!pessoa) {
    return res.status(404).json({ erro: "Pessoa não encontrada." });
  }

  return res.json(pessoa);
});

app.put("/pessoas/:id", (req, res) => {
  const id = idDaRota(req.params.id);
  const pessoa = pessoas.find((item) => item.id === id);

  if (!pessoa) {
    return res.status(404).json({ erro: "Pessoa não encontrada." });
  }
  if (!camposPessoaValidos(req.body)) {
    return res.status(400).json({
      erro: "Informe nome, CPF e dataNascimento válida (AAAA-MM-DD).",
    });
  }

  pessoa.nome = req.body.nome.trim();
  pessoa.cpf = req.body.cpf.trim();
  pessoa.dataNascimento = req.body.dataNascimento;
  return res.json({ mensagem: "Pessoa atualizada.", pessoa });
});

app.delete("/pessoas/:id", (req, res) => {
  const id = idDaRota(req.params.id);
  const indice = pessoas.findIndex((item) => item.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: "Pessoa não encontrada." });
  }

  pessoas.splice(indice, 1);
  const indicePassaporte = passaportes.findIndex(
    (item) => item.idPessoa === id,
  );
  if (indicePassaporte !== -1) {
    passaportes.splice(indicePassaporte, 1);
  }

  return res.json({ mensagem: "Pessoa e seu passaporte excluídos." });
});

app.post("/passaportes", (req, res) => {
  if (!camposPassaporteValidos(req.body)) {
    return res.status(400).json({
      erro:
        "Informe numero, dataEmissao, dataValidade e idPessoa válido. Use datas no formato AAAA-MM-DD.",
    });
  }

  const idPessoa = Number(req.body.idPessoa);
  if (!pessoas.some((item) => item.id === idPessoa)) {
    return res.status(404).json({ erro: "Pessoa associada não encontrada." });
  }
  if (passaportes.some((item) => item.idPessoa === idPessoa)) {
    return res.status(409).json({ erro: "Esta pessoa já possui passaporte." });
  }

  const passaporte = {
    id: proximoIdPassaporte++,
    numero: req.body.numero.trim(),
    dataEmissao: req.body.dataEmissao,
    dataValidade: req.body.dataValidade,
    idPessoa,
  };

  passaportes.push(passaporte);
  return res.status(201).json({ mensagem: "Passaporte cadastrado.", passaporte });
});

app.get("/passaportes", (req, res) => {
  res.json(passaportes);
});

app.get("/passaportes/:id", (req, res) => {
  const id = idDaRota(req.params.id);
  const passaporte = passaportes.find((item) => item.id === id);

  if (!passaporte) {
    return res.status(404).json({ erro: "Passaporte não encontrado." });
  }

  return res.json(passaporte);
});

app.put("/passaportes/:id", (req, res) => {
  const id = idDaRota(req.params.id);
  const passaporte = passaportes.find((item) => item.id === id);

  if (!passaporte) {
    return res.status(404).json({ erro: "Passaporte não encontrado." });
  }
  if (!camposPassaporteValidos(req.body)) {
    return res.status(400).json({
      erro:
        "Informe numero, dataEmissao, dataValidade e idPessoa válido. Use datas no formato AAAA-MM-DD.",
    });
  }

  const idPessoa = Number(req.body.idPessoa);
  if (!pessoas.some((item) => item.id === idPessoa)) {
    return res.status(404).json({ erro: "Pessoa associada não encontrada." });
  }
  if (
    passaportes.some(
      (item) => item.idPessoa === idPessoa && item.id !== passaporte.id,
    )
  ) {
    return res.status(409).json({ erro: "Esta pessoa já possui passaporte." });
  }

  passaporte.numero = req.body.numero.trim();
  passaporte.dataEmissao = req.body.dataEmissao;
  passaporte.dataValidade = req.body.dataValidade;
  passaporte.idPessoa = idPessoa;
  return res.json({ mensagem: "Passaporte atualizado.", passaporte });
});

app.delete("/passaportes/:id", (req, res) => {
  const id = idDaRota(req.params.id);
  const indice = passaportes.findIndex((item) => item.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: "Passaporte não encontrado." });
  }

  passaportes.splice(indice, 1);
  return res.json({ mensagem: "Passaporte excluído." });
});

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

app.use((erro, req, res, next) => {
  if (erro instanceof SyntaxError && erro.status === 400 && "body" in erro) {
    return res.status(400).json({ erro: "O corpo da requisição não é um JSON válido." });
  }

  console.error(erro);
  return res.status(500).json({ erro: "Erro interno do servidor." });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
