import { ApiWrapper } from "./apiWrapper"
import { ScrapperWrapper } from "./scrapperWrapper"
import {
  Boletim,
  Credenciais,
  DetalhesNota,
  Documento,
  InformaçõesPessoais,
  PeríodoLetivo
} from "./types"

export class ClientSuap {
  private readonly apiWrapper: ApiWrapper
  private readonly scrapperWrapper: ScrapperWrapper

  constructor()
  constructor(credentials: Credenciais)
  constructor(credentials?: Credenciais) {
    if (credentials) {
      this.apiWrapper = new ApiWrapper(credentials.api)
      this.scrapperWrapper = new ScrapperWrapper(
        credentials.site,
        credentials.matricula
      )
    } else {
      this.apiWrapper = new ApiWrapper()
      this.scrapperWrapper = new ScrapperWrapper()
    }
  }

  async obterCredenciais(): Promise<Credenciais> {
    return {
      matricula: this.scrapperWrapper.matriculation,
      api: this.apiWrapper.token,
      site: await this.scrapperWrapper.getCookies()
    }
  }

  async login(matriculation: string, password: string) {
    await this.apiWrapper.login(matriculation, password)
    await this.scrapperWrapper.login(matriculation, password)
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

  async detalharNota(códigoDiário: string): Promise<DetalhesNota> {
    return await this.scrapperWrapper.detalharNota(códigoDiário)
  }

  async obterDocumentos(): Promise<Documento[]> {
    return await this.scrapperWrapper.obterDocumentos()
  }
}
