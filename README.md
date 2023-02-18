# SDK (não oficial) do SUAP para Javascript

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![CI tests status](https://img.shields.io/github/workflow/status/save-labs/suap-sdk-javascript/ci)](https://github.com/save-labs/suap-sdk-javascript/actions/workflows/ci.yml)
[![NPM downloads](https://img.shields.io/npm/dm/suap-sdk-javascript)](https://npmjs.com/package/suap-sdk)

Esse SDK fornece uma interface para acessar os recursos da SUAP (alguns até mesmo não disponíveis na API) de forma simplificada.

## Instalação

```bash
npm install suap-sdk # ou "yarn add suap-sdk" ou "pnpm add suap-sdk" ou qualquer outro gerenciador de pacotes
```

## Como usar

### Fora do IFRN

Se você utilizar uma instância do SUAP diferente de "https://suap.ifrn.edu.br", você precisa defini-la.

```typescript
import { ClienteSuap } from "suap-sdk"

const cliente = new ClienteSuap({ urlBase: "https://suap.ifbaiano.edu.br" }) // ou a URL do SUAP do seu estado
```

### Fazer login com matrícula e senha

```typescript
import { ClienteSuap } from "suap-sdk"

const cliente = new ClienteSuap()

await cliente.login("<matricula>", "<senha>")
```

### Acessar apenas métodos da API

O SDK fonece metodos que não estão disponíveis na API, como `detalhesDaNota` e `obterDocumentos`. Para isso, é utilizada uma técnica de "web scraping" para acessar essas informações. Nãé utilizado um navegador, apenas um parser de HTML. Mas se você não quiser utilizar esses métodos, você pode desabilitar o web scraping.

```typescript
const cliente = new ClienteSuap({ usarApenasApi: true })
```

### Acessar com usuário já logado

Uma vez feito o login, você pode salvar os tokens de acesso e acessar a SUAP como esse usuário sem precisar fazer login novamente.

```typescript
const credenciais = cliente.obterCredenciais() // retorna um objeto. Você pode por exemplo salvar em um arquivo JSON

await client.entrarComCredenciais(credenciais)
```

### Obter informações pessoais

```typescript
const informaçõesPessoas = await cliente.obterInformaçõesPessoais()
```

### Obter períodos letivos

```typescript
const períodosLetivos = await cliente.obterPeríodosLetivos()
```

### Obter turmas virtuais

```typescript
const turmasVirtuais = await cliente.obterTurmasVirtuais()
```

### Obter os detalhes de uma turma virtual

```typescript
const detalhesDaTurmaVirtual = await cliente.obterDetalhesTurmaVirtual("<código diário>")
```

### Obter boletim

```typescript
const notas = await cliente.obterNotas(<ano letivo>, <período letivo>)
```

### Detalhar notas

```typescript
const detalhesDaNota = await cliente.obterInformaçõesPessoais("<código diário>")
```

### Obter documentos

```typescript
const documentos = await cliente.obterDocumentos()
```

### Baixar um documento

```typescript
// buffer
const documento = await cliente.baixarDocumento("<link do documento>")

// stream
const documento = await cliente.baixarDocumentoStream("<link do documento>")
```
