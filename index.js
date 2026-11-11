const express = require("express");
const app = express();
app.use(express.json());

const pessoas = [];
const passaportes = [];
let idPessoa = 1;
let idPassaporte = 1;

const dataValida = (valor) =>
  typeof valor === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
  !Number.isNaN(new Date(valor).getTime()) &&
  new Date(valor).toISOString().slice(0, 10) === valor;

const dadosPessoaValidos = (d) =>
  d && typeof d.nome === "string" && d.nome.trim() &&
  typeof d.cpf === "string" && d.cpf.trim() && dataValida(d.dataNascimento);

const dadosPassaporteValidos = (d) =>
  d && typeof d.numero === "string" && d.numero.trim() &&
  dataValida(d.dataEmissao) && dataValida(d.dataValidade) &&
  Number.isInteger(Number(d.idPessoa)) && Number(d.idPessoa) > 0;

function rotas(url, lista, nome, validar, criar, atualizar, aoExcluir) {
  app.get(url, (req, res) => res.json(lista));

  app.get(`${url}/:id`, (req, res) => {
    const item = lista.find((x) => x.id === Number(req.params.id));
    return item
      ? res.json(item)
      : res.status(404).json({ erro: `${nome} não encontrado(a).` });
  });

  app.post(url, (req, res) => {
    const erro = validar(req.body);
    if (erro) return res.status(erro.status).json({ erro: erro.mensagem });
    const item = criar(req.body);
    lista.push(item);
    return res.status(201).json({ mensagem: `${nome}: cadastro concluído.`, [nome.toLowerCase()]: item });
  });

  app.put(`${url}/:id`, (req, res) => {
    const item = lista.find((x) => x.id === Number(req.params.id));
    if (!item) return res.status(404).json({ erro: `${nome} não encontrado(a).` });
    const erro = validar(req.body, item);
    if (erro) return res.status(erro.status).json({ erro: erro.mensagem });
    atualizar(item, req.body);
    return res.json({ mensagem: `${nome}: atualização concluída.`, [nome.toLowerCase()]: item });
  });

  app.delete(`${url}/:id`, (req, res) => {
    const indice = lista.findIndex((x) => x.id === Number(req.params.id));
    if (indice < 0) return res.status(404).json({ erro: `${nome} não encontrado(a).` });
    const [item] = lista.splice(indice, 1);
    if (aoExcluir) aoExcluir(item);
    return res.json({ mensagem: `${nome}: exclusão concluída.` });
  });
}

rotas(
  "/pessoas",
  pessoas,
  "Pessoa",
  (d) => dadosPessoaValidos(d)
    ? null
    : { status: 400, mensagem: "Informe nome, CPF e dataNascimento válida (AAAA-MM-DD)." },
  (d) => ({ id: idPessoa++, nome: d.nome.trim(), cpf: d.cpf.trim(), dataNascimento: d.dataNascimento }),
  (p, d) => Object.assign(p, { nome: d.nome.trim(), cpf: d.cpf.trim(), dataNascimento: d.dataNascimento }),
  (p) => {
    const i = passaportes.findIndex((x) => x.idPessoa === p.id);
    if (i >= 0) passaportes.splice(i, 1);
  },
);

rotas(
  "/passaportes",
  passaportes,
  "Passaporte",
  (d, atual) => {
    if (!dadosPassaporteValidos(d))
      return { status: 400, mensagem: "Informe numero, datas válidas e idPessoa." };
    const pessoaId = Number(d.idPessoa);
    if (!pessoas.some((p) => p.id === pessoaId))
      return { status: 404, mensagem: "Pessoa associada não encontrada." };
    if (passaportes.some((p) => p.idPessoa === pessoaId && p.id !== atual?.id))
      return { status: 409, mensagem: "Esta pessoa já possui passaporte." };
    return null;
  },
  (d) => ({
    id: idPassaporte++,
    numero: d.numero.trim(),
    dataEmissao: d.dataEmissao,
    dataValidade: d.dataValidade,
    idPessoa: Number(d.idPessoa),
  }),
  (p, d) => Object.assign(p, {
    numero: d.numero.trim(),
    dataEmissao: d.dataEmissao,
    dataValidade: d.dataValidade,
    idPessoa: Number(d.idPessoa),
  }),
);

app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada." }));
app.use((erro, req, res, next) => {
  if (erro instanceof SyntaxError && erro.status === 400)
    return res.status(400).json({ erro: "JSON inválido." });
  console.error(erro);
  return res.status(500).json({ erro: "Erro interno do servidor." });
});

app.listen(process.env.PORT || 3000, () =>
  console.log(`Servidor rodando em http://localhost:${process.env.PORT || 3000}`),
);
