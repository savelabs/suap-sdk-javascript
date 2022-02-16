import axios from "axios"
import cheerio from "cheerio"
import { chunk, zipObject } from "./utils"
import { DetalhesNota, Documento } from "./types"
import { wrapper } from "axios-cookiejar-support"
import { CookieJar } from "tough-cookie"

export class ScrapperWrapper {
  private jar = new CookieJar()
  public instance = wrapper(
    axios.create({
      baseURL: "https://suap.ifrn.edu.br",
      withCredentials: true,
      headers: {
        Host: "suap.ifrn.edu.br",
        Origin: "https://suap.ifrn.edu.br",
        Referer: "https://suap.ifrn.edu.br/accounts/login/?next=",
        "User-Agent": "Aplicativo Save"
      },
      jar: this.jar
    })
  )

  public matrícula: string | null = null

  constructor()
  constructor(cookies: string, matrícula: string)
  constructor(cookies?: string, matrícula?: string) {
    if (cookies) {
      this.jar.setCookie(cookies, "https://suap.ifrn.edu.br").then()
      this.matrícula = matrícula
    }
  }

  async getCookies() {
    return await this.jar.getCookieString("https://suap.ifrn.edu.br")
  }

  async login(matrícula: string, password: string) {
    this.matrícula = matrícula

    await this.instance.get("/accounts/login/")

    const cookies = await this.getCookies()

    await this.instance.post(
      "/accounts/login/",
      new URLSearchParams({
        username: matrícula,
        password,
        this_is_the_login_form: "1",
        csrfmiddlewaretoken: cookies.split("csrftoken=")[1].split(";")[0]
      }).toString()
    )

    await this.instance.get("/")
  }

  async detalharNota(códigoDiário: string): Promise<DetalhesNota> {
    let response = await this.instance.get(
      `/edu/aluno/${this.matrícula}/?tab=boletim`
    )
    let $ = cheerio.load(response.data)

    const href = $(`tr:has(> td:contains("${códigoDiário}")) > td > a`).attr(
      "href"
    )

    response = await this.instance.get(href)

    $ = cheerio.load(response.data)

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

    const $ = cheerio.load(response.data)

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
