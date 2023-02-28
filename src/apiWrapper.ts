import {
  Boletim,
  InformaçõesPessoais,
  InformaçõesTurmaVirtual,
  PeríodoLetivo,
  TurmaVirtual
} from "./types"

export class ApiWrapper {
  public token = ""
  public refreshToken = ""
  public urlBase = ""
  private errorCount = 0

  constructor(urlBase: string) {
    this.urlBase = urlBase
  }

  private async request<T>(
    method: "GET" | "POST",
    url: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await fetch(`${this.urlBase}/api/v2${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token ? `Bearer ${this.token}` : ""
        },
        body: JSON.stringify(data)
      })

      return await response.json()
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.errorCount++
        if (this.errorCount > 2) {
          this.errorCount = 0
          throw error
        } else {
          await this.renovarToken()
          return this.request(method, url, data)
        }
      } else {
        throw error
      }
    }
  }

  loginWithTokens(refreshToken: string, accessToken: string) {
    this.refreshToken = refreshToken
    this.token = accessToken
  }

  async login(matriculation: string, password: string) {
    const data = await this.request<{ access: string; refresh: string }>(
      "POST",
      "/autenticacao/token/?format=json",
      {
        username: matriculation,
        password
      }
    )

    this.token = data.access
    this.refreshToken = data.refresh
  }

  async renovarToken() {
    const data = await this.request<{ access: string }>(
      "POST",
      "/autenticacao/token/refresh/",
      {
        refresh: this.refreshToken
      }
    )

    this.token = data.access
    return this.token
  }

  obterInformações(): Promise<InformaçõesPessoais> {
    return this.request<InformaçõesPessoais>(
      "GET",
      "/minhas-informacoes/meus-dados/"
    )
  }

  obterPeríodosLetivos(): Promise<PeríodoLetivo[]> {
    return this.request<PeríodoLetivo[]>(
      "GET",
      "/minhas-informacoes/meus-periodos-letivos/"
    )
  }

  obterNotas(anoLetivo: number, períodoLetivo: number): Promise<Boletim[]> {
    return this.request<Boletim[]>(
      "GET",
      `/minhas-informacoes/boletim/${anoLetivo}/${períodoLetivo}/`
    )
  }

  obterTurmasVirtuais(
    anoLetivo: number,
    períodoLetivo: number
  ): Promise<TurmaVirtual[]> {
    return this.request<TurmaVirtual[]>(
      "GET",
      `/minhas-informacoes/turmas-virtuais/${anoLetivo}/${períodoLetivo}/`
    )
  }

  obterInformaçõesTurmaVirtual(
    códigoDiário: string
  ): Promise<InformaçõesTurmaVirtual> {
    return this.request<InformaçõesTurmaVirtual>(
      "GET",
      `/minhas-informacoes/turma-virtual/${códigoDiário}/`
    )
  }
}
