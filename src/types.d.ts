/* eslint-disable camelcase */
export type PeríodoLetivo = {
  ano_letivo: number
  periodo_letivo: number
}

export type Nota = {
  nota: number
  faltas: number
}

export type Boletim = {
  codigo_diario: string
  disciplina: string
  segundo_semestre: boolean
  carga_horaria: number
  carga_horaria_cumprida: number
  numero_faltas: number
  percentual_carga_horaria_frequentada: number
  situacao: string
  quantidade_avaliacoes: number
  nota_etapa_1: Nota
  nota_etapa_2: Nota
  nota_etapa_3: Nota
  nota_etapa_4: Nota
  media_disciplina: number
  nota_avaliacao_final: Nota
  media_final_disciplina: string
}

export type InformaçõesPessoais = {
  id: number
  matricula: string
  nome_usual: string
  cpf: string
  rg: string
  filiacao: Array<string | null>
  data_nascimento: string
  naturalidade: string
  tipo_sanguineo: string
  email: string
  url_foto_75x100: string
  url_foto_150x200: string
  tipo_vinculo: string
  vinculo: {
    matricula: string
    nome: string
    curso: string
    campus: string
    situacao: string
    cota_sistec: string
    cota_mec: string
    situacao_sistemica: string
    matricula_regular: any
    linha_pesquisa: any
    curriculo_lattes: string
  }
}

export type Documento = {
  nome: string
  link: string
}

export type DetalhesNota = {
  Professores: string
  "Detalhamento das Notas": { [key: string]: string }
}
