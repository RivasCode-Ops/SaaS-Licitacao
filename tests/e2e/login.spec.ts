import { test, expect } from "@playwright/test"

test.describe("Landing page", () => {
  test("shows the main heading", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Licitações públicas simplificadas")).toBeVisible()
  })

  test("has a link to pricing", async ({ page }) => {
    await page.goto("/")
    await page.getByText("Ver planos").click()
    await expect(page).toHaveURL("/pricing")
  })
})

test.describe("Login flow", () => {
  test("shows login form", async ({ page }) => {
    await page.goto("/login/sign-in")
    await expect(page.getByText("Entrar")).toBeVisible()
  })

  test("redirects to dashboard on successful login", async ({ page }) => {
    await page.goto("/login/sign-in")
    await page.fill('input[name="email"]', "admin@licita.dev")
    await page.fill('input[name="password"]', "123456")
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL("/dashboard", { timeout: 15000 })
  })

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login/sign-in")
    await page.fill('input[name="email"]', "admin@licita.dev")
    await page.fill('input[name="password"]', "wrong")
    await page.click('button[type="submit"]')
    await expect(page.getByText("inválidos")).toBeVisible({ timeout: 10000 })
  })
})
