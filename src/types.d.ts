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
