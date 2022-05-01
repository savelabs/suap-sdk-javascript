import axios from "axios"
import { load } from "cheerio"
import { chunk, zipObject } from "./utils"
import { DetalhesNota, Documento } from "./types"
import { wrapper } from "axios-cookiejar-support"
import { CookieJar } from "tough-cookie"

export class ScrapperWrapper {
  public instance = axios.create({
    baseURL: "https://suap.ifrn.edu.br",
    withCredentials: true,
    headers: {
      Host: "suap.ifrn.edu.br",
      Origin: "https://suap.ifrn.edu.br",
      Referer: "https://suap.ifrn.edu.br/accounts/login/?next=",
      "User-Agent": "Aplicativo Save"
    }
  })

  public cookies: string

  public matrícula: string | null = null

  async loginWithCookies(matrícula: string, cookies: string) {
    this.matrícula = matrícula
    this.cookies = cookies
    this.instance.defaults.headers.common.Cookie = cookies
  }

  async login(matrícula: string, password: string) {
    this.matrícula = matrícula

    const jar = new CookieJar()

    const instance = wrapper(
      axios.create({
        baseURL: "https://suap.ifrn.edu.br",
        headers: {
          Host: "suap.ifrn.edu.br",
          Origin: "https://suap.ifrn.edu.br",
          Referer: "https://suap.ifrn.edu.br/accounts/login/?next=",
          "User-Agent": "Aplicativo Save"
        },
        jar
      })
    )

    await instance.get("/accounts/login/")

    const cookies = await jar.getCookieString("https://suap.ifrn.edu.br")

    await instance.post(
      "/accounts/login/",
      new URLSearchParams({
        username: matrícula,
        password,
        this_is_the_login_form: "1",
        csrfmiddlewaretoken: cookies.split("csrftoken=")[1].split(";")[0]
      }).toString()
    )

    await instance.get("/")

    this.cookies = await jar.getCookieString("https://suap.ifrn.edu.br")
    this.instance.defaults.headers.common.Cookie = this.cookies
  }

  async obterInformações() {
    const response = await this.instance.get("/")

    const $ = load(response.data)
    $("div.box").each((i, el) => {
      const $el = $(el)
      const title = $el.find("h3").text()
      const data = $el.find("p").text()
      console.log(title, data)
    })
  }

  async detalharNota(códigoDiário: string): Promise<DetalhesNota> {
    let response = await this.instance.get(
      `/edu/aluno/${this.matrícula}/?tab=boletim`
    )
    let $ = load(response.data)

    const href = $(`tr:has(> td:contains("${códigoDiário}")) > td > a`).attr(
      "href"
    )

    response = await this.instance.get(href)

    $ = load(response.data)

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
    const response = await this.instance.get(`/edu/aluno/${this.matrícula}/`)

    const $ = load(response.data)

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
}
