import { ApiWrapper } from "./apiWrapper"
import { ScrapperWrapper } from "./scrapperWrapper"
import {
  Boletim,
  DetalhesNota,
  Documento,
  InformaçõesPessoais,
  PeríodoLetivo
} from "./types"

export class ClientSuap {
  private readonly apiWrapper = new ApiWrapper()
  private readonly scrapperWrapper = new ScrapperWrapper()

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
