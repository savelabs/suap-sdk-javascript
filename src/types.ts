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

export type Credenciais = {
  matricula: string
  api: string
  site?: string
}

export type ClienteSuapArgs = {
  credenciais?: Credenciais
  usarApenasApi?: boolean
}

export type TurmaVirtual = {
  id: number
  sigla: string
  descricao: string
  observacao: string
  locais_de_aula: Array<string>
  horarios_de_aula: string
}

export type UsuárioTurmaVirtual = {
  foto: string
  nome: string
  matricula: string
  email: string
}

export type Aulas = {
  data: string
  etapa: number
  quantidade: number
  faltas: number
  professor: string
  conteudo: string
}

export type MaterialDeAula = {
  url: string
  descricao: string
  data_vinculacao: string
}

export type InformaçõesTurmaVirtual = {
  id: number
  ano_letivo: string
  periodo_letivo: string
  componente_curricular: string
  professores: UsuárioTurmaVirtual[]
  locais_de_aula: Array<string>
  data_inicio: string
  data_fim: string
  participantes: UsuárioTurmaVirtual[]
  aulas: Aulas[]
  materiais_de_aula: MaterialDeAula[]
}
