import { Client } from "../src"

test("login", async () => {
  const client = new Client()

  await client.login(process.env.SUAP_MATRICULATION, process.env.SUAP_PASSWORD)

  expect(client.credentials).toMatchObject({
    api: expect.any(String),
    scrapper: expect.any(String)
  })
})

test("login with incorrect credentials", async () => {
  const client = new Client()

  await expect(client.login("", "")).rejects.toThrow(Error)
})
