# API de pessoas e passaportes

## Executar

```bash
npm install
npm run dev
```

O servidor inicia em `http://localhost:3000`. Os dados ficam em arrays e são
apagados quando o servidor reinicia.

Envie `Content-Type: application/json` nas requisições com corpo. As datas devem
usar o formato `AAAA-MM-DD`.

## Rotas

| Método | Endpoint | Ação |
| --- | --- | --- |
| POST | `/pessoas` | Cadastrar pessoa |
| GET | `/pessoas` | Listar pessoas |
| GET | `/pessoas/:id` | Buscar pessoa |
| PUT | `/pessoas/:id` | Atualizar pessoa |
| DELETE | `/pessoas/:id` | Excluir pessoa e seu passaporte |
| POST | `/passaportes` | Cadastrar passaporte |
| GET | `/passaportes` | Listar passaportes |
| GET | `/passaportes/:id` | Buscar passaporte |
| PUT | `/passaportes/:id` | Atualizar passaporte |
| DELETE | `/passaportes/:id` | Excluir passaporte |

Exemplo de pessoa:

```json
{
  "nome": "Ana Silva",
  "cpf": "12345678900",
  "dataNascimento": "1995-08-20"
}
```

Exemplo de passaporte (use o `id` de uma pessoa cadastrada):

```json
{
  "numero": "AB123456",
  "dataEmissao": "2024-01-10",
  "dataValidade": "2034-01-10",
  "idPessoa": 1
}
```

Cada pessoa pode ter no máximo um passaporte, e o passaporte só pode ser
cadastrado ou atualizado para uma pessoa existente.
