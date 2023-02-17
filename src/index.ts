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
  TurmaVirtual
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

  async obterCredenciais(): Promise<Credenciais> {
    const result = {
      matricula: this.matrícula,
      api: this.apiWrapper.token,
      site: null
    }

    if (!this.usarApenasApi) {
      result.site = this.scrapperWrapper.cookies
    }

    return result
  }

  async loginWithCredentials(credenciais: Credenciais) {
    this.matrícula = credenciais.matricula
    this.apiWrapper.loginWithToken(credenciais.api)
    if (!this.usarApenasApi) {
      await this.scrapperWrapper.loginWithCookies(
        this.matrícula,
        credenciais.site
      )
    }
  }

  async login(matrícula: string, password: string) {
    this.matrícula = matrícula
    await this.apiWrapper.login(matrícula, password)
    if (!this.usarApenasApi) {
      await this.scrapperWrapper.login(matrícula, password)
    }
  }

  async obterInformaçõesPessoais(): Promise<InformaçõesPessoais> {
    return await this.apiWrapper.obterInformações()
  }

  async obterPeríodosLetivos(): Promise<PeríodoLetivo[]> {
    return await this.apiWrapper.obterPeríodosLetivos()
  }

  async obterNotas(
    anoLetivo: number,
    períodoLetivo: number
  ): Promise<Boletim[]> {
    return await this.apiWrapper.obterNotas(anoLetivo, períodoLetivo)
  }

  async detalharNota(
    códigoDiário: string,
    anoLetivo: number,
    períodoLetivo: number
  ): Promise<DetalhesNota> {
    if (this.usarApenasApi) {
      throw new Error("Não é possível obter detalhes de notas apenas da API")
    } else {
      return await this.scrapperWrapper.detalharNota(
        códigoDiário,
        anoLetivo,
        períodoLetivo
      )
    }
  }

  async obterDocumentos(): Promise<Documento[]> {
    if (this.usarApenasApi) {
      throw new Error("Não é possível obter documentos apenas da API")
    } else {
      return await this.scrapperWrapper.obterDocumentos()
    }
  }

  async obterTurmasVirtuais(
    anoLetivo: number,
    períodoLetivo: number
  ): Promise<TurmaVirtual[]> {
    return await this.apiWrapper.obterTurmasVirtuais(anoLetivo, períodoLetivo)
  }

  async obterDetalhesTurmaVirtual(
    códigoDiário: string
  ): Promise<InformaçõesTurmaVirtual> {
    return await this.apiWrapper.obterInformaçõesTurmaVirtual(códigoDiário)
  }

  async renovarToken(): Promise<string> {
    return await this.apiWrapper.renovarToken()
  }

  async baixarDocumento(link: string): Promise<Buffer> {
    if (this.usarApenasApi) {
      throw new Error("Não é possível baixar documentos apenas da API")
    } else {
      return await this.scrapperWrapper.baixarDocumento(link)
    }
  }

  async baixarDocumentoStream(link: string): Promise<Buffer> {
    if (this.usarApenasApi) {
      throw new Error("Não é possível baixar documentos apenas da API")
    } else {
      return await this.scrapperWrapper.baixarDocumentoStream(link)
    }
  }

  async calcularIRAPrevisto(
    anoLetivo: number,
    periodoLetivo: number
  ): Promise<number> {
    const boletins = await this.obterNotas(anoLetivo, periodoLetivo)

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

    return p1 / p2
  }
}

export * from "./types"
