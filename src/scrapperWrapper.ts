import { load } from "cheerio"
import { chunk, zipObject } from "./utils"
import { DetalhesNota, Documento } from "./types"
import makeFetchCookie from "fetch-cookie"

export class ScrapperWrapper {
  public urlBase: string
  public cookies: string
  public matrícula: string | null = null
  private jar = new makeFetchCookie.toughCookie.CookieJar()
  private fetch = makeFetchCookie(fetch, this.jar)

  constructor(urlBase: string) {
    this.urlBase = urlBase
  }

  private request(method: "GET" | "POST", url: string, data?: any) {
    return this.fetch(`${this.urlBase}${url}`, {
      method,
      credentials: "include",
      headers: {
        Host: new URL(this.urlBase).host,
        Origin: this.urlBase,
        Referer: `${this.urlBase}/accounts/login/?next=`,
        "User-Agent": "suap-sdk-javascript",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: data
    })
  }

  async loginWithCookies(matrícula: string, cookies: string) {
    this.matrícula = matrícula
    this.cookies = cookies
    await this.jar.setCookie(cookies, this.urlBase)
  }

  async login(matrícula: string, password: string) {
    this.matrícula = matrícula

    await this.request("GET", "/accounts/login/?next=")

    const cookies = await this.jar.getCookieString(this.urlBase)

    await this.request(
      "POST",
      "/accounts/login/",
      new URLSearchParams({
        username: matrícula,
        password,
        this_is_the_login_form: "1",
        csrfmiddlewaretoken: cookies.split("csrftoken=")[1].split(";")[0]
      }).toString()
    )

    await this.request("GET", "/")

    this.cookies = await this.jar.getCookieString(this.urlBase)
  }

  async obterInformações() {
    const response = await this.request("GET", "/")

    const $ = load(await response.text())
    $("div.box").each((i, el) => {
      const $el = $(el)
      const title = $el.find("h3").text()
      const data = $el.find("p").text()
      console.log(title, data)
    })
  }

  async detalharNota(
    códigoDiário: string,
    anoLetivo: number,
    períodoLetivo: number
  ): Promise<DetalhesNota> {
    let response = await this.request(
      "GET",
      `/edu/aluno/${this.matrícula}/?tab=boletim&ano_periodo=${anoLetivo}_${períodoLetivo}`
    )
    let $ = load(await response.text())

    const href = $(`tr:has(> td:contains("${códigoDiário}")) > td > a`).attr(
      "href"
    )

    response = await this.request("GET", href)

    $ = load(await response.text())

    const teachers = $("#content > div:nth-child(3) > div").text()

    const titles = $("#content > div:nth-child(4) > div > h4")
      .toArray()
      .map((el) => $(el).text().replace(/\s+/g, " "))

    const data = $("#content > div:nth-child(4) > div > table")
      .toArray()
      .map((el) => {
        const $el = $(el)
        const data = $el
          .find("td")
          .toArray()
          .map((el) => $(el).text())
        const result = []
        chunk(data, 5).forEach((chunk: string[]) => {
          result.push({
            Sigla: chunk[0],
            Tipo: chunk[1],
            Descrição: chunk[2],
            Peso: chunk[3],
            "Nota Obtida": chunk[4]
          })
        })
        return result
      })

    return {
      Professores: teachers.trim(),
      "Detalhamento das Notas": zipObject(titles, data)
    }
  }

  async obterDocumentos(): Promise<Documento[]> {
    const response = await this.request("GET", `/edu/aluno/${this.matrícula}/`)

    const $ = load(await response.text())

    const documents = $(
      "#content > div.title-container > div.action-bar-container > ul > li:nth-child(2) > ul > li > a"
    )
      .toArray()
      .map((el) => {
        const $el = $(el)
        return {
          nome: $el.text(),
          link: $el.attr("href")
        }
      })

    return documents
  }

  async baixarDocumento(link: string): Promise<ArrayBuffer> {
    const response = await this.request("GET", link)

    return await response.arrayBuffer()
  }

  async baixarDocumentoStream(link: string) {
    const response = await this.request("GET", link)

    return response.body
  }
}
