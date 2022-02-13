import { ClientSuap } from "../src"

test("login", async () => {
  const client = new ClientSuap()

  await client.login(process.env.SUAP_MATRICULATION, process.env.SUAP_PASSWORD)
})

test("login with incorrect credentials", async () => {
  const client = new ClientSuap()

  await expect(client.login("", "")).rejects.toThrow(Error)
})
