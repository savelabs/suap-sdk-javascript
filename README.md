# SDK (não oficial) do SUAP para Javascript

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![CI tests status](https://img.shields.io/github/workflow/status/save-ifrn/suap-sdk-javascript/ci)](https://github.com/save-ifrn/suap-sdk-javascript/actions/workflows/ci.yml)
[![NPM downloads](https://img.shields.io/npm/dm/suap-sdk-javascript)](https://npmjs.com/package/suap-sdk-javascript)

Esse SDK fornece uma interface para acessar os recursos da SUAP (alguns até mesmo não disponíveis na API) de forma simplificada.

## Instalação

```bash
npm install suap-sdk-javascript
```

## Como usar

### Fazer login

```typescript
import { ClientSuap } from "suap-sdk-javascript"

const cliente = new ClientSuap()

await cliente.login("<matricula>", "<senha>")
```

### Obter informações pessoais

```typescript
const informaçõesPessoas = await cliente.obterInformaçõesPessoais()
```

### Obter períodos letivos

```typescript
const períodosLetivos = await cliente.obterPeríodosLetivos()
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
