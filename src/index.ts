import { ApiWrapper } from "./apiWrapper"
import { ScrapperWrapper } from "./scrapperWrapper"
import {
  Boletim,
  Credenciais,
  DetalhesNota,
  Documento,
  InformaçõesPessoais,
  PeríodoLetivo,
  ClienteSuapArgs,
  InformaçõesTurmaVirtual,
  TurmaVirtual,
  CalcularNotasSemestralArgs,
  CalcularNotasAnualArgs,
  PontuaçãoNecessária
} from "./types"

export class ClienteSuap {
  private readonly apiWrapper: ApiWrapper
  private readonly scrapperWrapper: ScrapperWrapper
  public matrícula: string | null = null
  public urlBase = ""

  private usarApenasApi = false

  constructor({ usarApenasApi, urlBase }: ClienteSuapArgs = {}) {
    this.usarApenasApi = usarApenasApi ?? false
    this.urlBase = urlBase ?? "https://suap.ifrn.edu.br"
    this.apiWrapper = new ApiWrapper(this.urlBase)

    if (!this.usarApenasApi) {
      this.scrapperWrapper = new ScrapperWrapper(this.urlBase)
    }
  }

  obterCredenciais(): Credenciais {
    const result = {
      matricula: this.matrícula,
      api: {
        refresh: this.apiWrapper.refreshToken,
        access: this.apiWrapper.token
      },
      site: null
    }

    if (!this.usarApenasApi) {
      result.site = this.scrapperWrapper.cookies
    }

    return result
  }

  async entrarComCredenciais(credenciais: Credenciais) {
    this.matrícula = credenciais.matricula
    this.apiWrapper.loginWithTokens(
      credenciais.api.refresh,
      credenciais.api.access
    )
    if (!this.usarApenasApi) {
      await this.scrapperWrapper.loginWithCookies(
        this.matrícula,
        credenciais.site
      )
    }
  }

  async login(matrícula: string, password: string): Promise<Credenciais> {
    this.matrícula = matrícula
    await this.apiWrapper.login(matrícula, password)
    if (!this.usarApenasApi) {
      await this.scrapperWrapper.login(matrícula, password)
    }

    return this.obterCredenciais()
  }

  obterInformaçõesPessoais(): Promise<InformaçõesPessoais> {
    return this.apiWrapper.obterInformações()
  }

  async obterPeríodosLetivos(): Promise<PeríodoLetivo[]> {
    return this.apiWrapper.obterPeríodosLetivos()
  }

  obterNotas(anoLetivo: number, períodoLetivo: number): Promise<Boletim[]> {
    return this.apiWrapper.obterNotas(anoLetivo, períodoLetivo)
  }

  detalharNota(
    códigoDiário: string,
    anoLetivo: number,
    períodoLetivo: number
  ): Promise<DetalhesNota> {
    if (this.usarApenasApi) {
      throw new Error("Não é possível obter detalhes de notas apenas da API")
    } else {
      return this.scrapperWrapper.detalharNota(
        códigoDiário,
        anoLetivo,
        períodoLetivo
      )
    }
  }

  obterDocumentos(): Promise<Documento[]> {
    if (this.usarApenasApi) {
      throw new Error("Não é possível obter documentos apenas da API")
    } else {
      return this.scrapperWrapper.obterDocumentos()
    }
  }

  obterTurmasVirtuais(
    anoLetivo: number,
    períodoLetivo: number
  ): Promise<TurmaVirtual[]> {
    return this.apiWrapper.obterTurmasVirtuais(anoLetivo, períodoLetivo)
  }

  obterDetalhesTurmaVirtual(
    códigoDiário: string
  ): Promise<InformaçõesTurmaVirtual> {
    return this.apiWrapper.obterInformaçõesTurmaVirtual(códigoDiário)
  }

  renovarToken(): Promise<string> {
    return this.apiWrapper.renovarToken()
  }

  baixarDocumento(link: string): Promise<ArrayBuffer> {
    if (this.usarApenasApi) {
      throw new Error("Não é possível baixar documentos apenas da API")
    } else {
      return this.scrapperWrapper.baixarDocumento(link)
    }
  }

  baixarDocumentoStream(link: string): Promise<any> {
    if (this.usarApenasApi) {
      throw new Error("Não é possível baixar documentos apenas da API")
    } else {
      return this.scrapperWrapper.baixarDocumentoStream(link)
    }
  }

  calcularIRAPrevisto(boletins: Boletim[]): number {
    const p1 = boletins
      .map((boletim) => {
        if (boletim.quantidade_avaliacoes === 4) {
          return (
            ((boletim.nota_etapa_1.nota * 2 +
              boletim.nota_etapa_2.nota * 2 +
              boletim.nota_etapa_3.nota * 3 +
              boletim.nota_etapa_4.nota * 3) /
              10) *
            boletim.carga_horaria
          )
        } else {
          return (
            ((boletim.nota_etapa_1.nota * 2 + boletim.nota_etapa_2.nota * 3) /
              5) *
            boletim.carga_horaria
          )
        }
      })
      .reduce((a, b) => a + b, 0)
    const p2 = boletins
      .map((boletim) => boletim.carga_horaria)
      .reduce((a, b) => a + b, 0)

    return Number((p1 / p2).toFixed(2))
  }

  calcularNotasAnual(...args: CalcularNotasAnualArgs): PontuaçãoNecessária {
    let n1 = args[0]
    let n2 = args[1]
    let n3 = args[2]
    let n4 = args[3]
    const naf = args[4]

    const onlyFinal = n4 !== undefined

    let filled = 0
    let empty = 0
    let score = 0
    const response: PontuaçãoNecessária = {
      situação: "Aprovado"
    }

    if (n1 !== undefined) {
      score += n1 * 2
      filled += 200
    } else n1 = 100

    if (n2 !== undefined) {
      score += n2 * 2
      filled += 200
    } else n2 = 100

    if (n3 !== undefined) {
      score += n3 * 3
      filled += 300
    } else n3 = 100

    if (n4 !== undefined) {
      score += n4 * 3
      filled += 300
    } else n4 = 100

    empty = 1000 - filled
    if (score < 600) {
      let diff = 600 - score
      if (diff <= empty) {
        response["situação"] = "Cursando"
        response.média = Math.round((diff / empty) * 100)
      } else if (naf === undefined) {
        diff -= empty
        const md = (n1 * 2 + n2 * 2 + n3 * 2 + n4 * 2) / 10
        const naf1 = 120 - md
        const naf2 = (600 - n2 * 2 - n3 * 3 - n4 * 3) / 2
        const naf3 = (600 - n1 * 2 - n3 * 3 - n4 * 3) / 2
        const naf4 = (600 - n1 * 2 - n2 * 2 - n4 * 3) / 3
        const naf5 = (600 - n1 * 2 - n2 * 2 - n3 * 3) / 3
        const result = Math.min(naf1, naf2, naf3, naf4, naf5)
        if (result > 100) {
          response["situação"] = "Reprovado"
        } else {
          response["situação"] = "Recuperação"
          response.nota_prova_final = Math.round(result)
          response.média = onlyFinal ? undefined : 100
        }
      } else {
        const md = score / 10
        const mfd1 = (md + naf) / 2
        const mfd2 = (2 * naf + 2 * n2 + 3 * n3 + 3 * n4) / 10
        const mfd3 = (2 * n1 + 2 * naf + 3 * n3 + 3 * n4) / 10
        const mfd4 = (2 * n1 + 2 * n2 + 3 * naf + 3 * n4) / 10
        const mfd5 = (2 * n1 + 2 * n2 + 3 * n3 + 3 * naf) / 10
        const result = Math.max(mfd1, mfd2, mfd3, mfd4, mfd5)
        response.nota_prova_final = 0
        response.média = 0

        if (result < 60) {
          response["situação"] = "Reprovado"
        } else {
          response["situação"] = "Aprovado"
        }
      }
    } else {
      response["situação"] = "Aprovado"
    }

    return response
  }

  calcularNotasSemestral(
    ...args: CalcularNotasSemestralArgs
  ): PontuaçãoNecessária {
    let n1 = args[0]
    let n2 = args[1]
    const naf = args[2]

    const onlyFinal = n2 !== undefined

    let filled = 0
    let empty = 0
    let score = 0
    const response: PontuaçãoNecessária = {
      situação: "Aprovado"
    }
    if (n1 !== undefined) {
      score += n1 * 2
      filled += 200
    } else n1 = 100
    if (n2 !== undefined) {
      score += n2 * 3
      filled += 300
    } else n2 = 100

    empty = 500 - filled
    if (score < 300) {
      let diff = 300 - score
      if (diff <= empty) {
        response["situação"] = "Cursando"
        response.média = (diff / empty) * 100
      } else if (naf === undefined) {
        diff -= empty
        const md = (n1 * 2 + n2 * 3) / 5
        const naf1 = 120 - md
        const naf2 = (300 - n2 * 3) / 2
        const naf3 = (300 - n1 * 2) / 3
        const result = Math.min(naf1, naf2, naf3)

        if (result > 100) {
          response["situação"] = "Reprovado"
        } else {
          response["situação"] = "Recuperação"
          response.nota_prova_final = result
          response.média = onlyFinal ? undefined : 100
        }
      } else {
        const md = (n1 * 2 + n2 * 3) / 5
        const mfd1 = (md + naf) / 2
        const mfd2 = (2 * naf + 3 * naf) / 5
        const mfd3 = (2 * n1 + 3 * naf) / 5
        const result = Math.max(mfd1, mfd2, mfd3)

        if (result < 60) {
          result["situação"] = "Reprovado"
        } else {
          result["situação"] = "Aprovado"
        }
      }
    } else {
      response["situação"] = "Aprovado"
    }

    return response
  }
}

export * from "./types"
