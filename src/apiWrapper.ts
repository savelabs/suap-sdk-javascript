import axios from "axios"
import {
  Boletim,
  InformaçõesTurmaVirtual,
  PeríodoLetivo,
  TurmaVirtual
} from "./types"

export class ApiWrapper {
  public token = ""
  public instance = axios.create({
    baseURL: "https://suap.ifrn.edu.br/api/v2",
    headers: {
      "Content-Type": "application/json"
    }
  })

  constructor(token: string = "") {
    if (token) {
      this.token = token
      this.instance.defaults.headers.common.Authorization = `JWT ${token}`
    }
  }

  async login(matriculation: string, password: string) {
    const response = await this.instance.post(
      "/autenticacao/token/?format=json",
      {
        username: matriculation,
        password
      }
    )
    this.token = response.data.token
    this.instance.defaults.headers.common.Authorization = `JWT ${this.token}`
  }

  async obterInformações() {
    const response = await this.instance.get("/minhas-informacoes/meus-dados/")
    return response.data
  }

  async obterPeríodosLetivos(): Promise<PeríodoLetivo[]> {
    const response = await this.instance.get(
      "/minhas-informacoes/meus-periodos-letivos/"
    )
    return response.data
  }

  async obterNotas(
    anoLetivo: number,
    períodoLetivo: number
  ): Promise<Boletim[]> {
    const response = await this.instance.get(
      `/minhas-informacoes/boletim/${anoLetivo}/${períodoLetivo}/`
    )

    return response.data
  }

  async obterTurmasVirtuais(
    anoLetivo: number,
    períodoLetivo: number
  ): Promise<TurmaVirtual[]> {
    const response = await this.instance.get(
      `/minhas-informacoes/turmas-virtuais/${anoLetivo}/${períodoLetivo}/`
    )

    return response.data
  }

  async obterInformaçõesTurmaVirtual(
    códigoDiário: string
  ): Promise<InformaçõesTurmaVirtual> {
    const response = await this.instance.get(
      `/minhas-informacoes/turma-virtual/${códigoDiário}/`
    )

    return response.data
  }
}
