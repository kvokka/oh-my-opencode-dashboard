import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import { describe, expect, it } from "vitest"

import { ensureUiAssets, getDistIndexPath } from "./ui-assets"

function mkTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

describe("ensureUiAssets", () => {
  it("does nothing when dist/index.html already exists", async () => {
    const packageRoot = mkTempDir("omo-ui-assets-pkg-")
    const distRoot = path.join(packageRoot, "dist")
    fs.mkdirSync(distRoot, { recursive: true })
    fs.writeFileSync(getDistIndexPath(distRoot), "<html></html>", "utf8")

    let buildCalls = 0

    await ensureUiAssets({
      packageRoot,
      distRoot,
      buildUi: async () => {
        buildCalls += 1
        return { success: true }
      },
    })

    expect(buildCalls).toBe(0)
  })

  it("builds the UI when dist/index.html is missing", async () => {
    const packageRoot = mkTempDir("omo-ui-assets-pkg-")
    const distRoot = path.join(packageRoot, "dist")

    let buildCalls = 0

    await ensureUiAssets({
      packageRoot,
      distRoot,
      buildUi: async () => {
        buildCalls += 1
        fs.mkdirSync(distRoot, { recursive: true })
        fs.writeFileSync(getDistIndexPath(distRoot), "<html></html>", "utf8")
        return { success: true }
      },
    })

    expect(buildCalls).toBe(1)
    expect(fs.existsSync(getDistIndexPath(distRoot))).toBe(true)
  })

  it("throws when the build does not produce dist/index.html", async () => {
    const packageRoot = mkTempDir("omo-ui-assets-pkg-")
    const distRoot = path.join(packageRoot, "dist")

    await expect(
      ensureUiAssets({
        packageRoot,
        distRoot,
        buildUi: async () => ({ success: true }),
      }),
    ).rejects.toThrow("dist/index.html is missing")
  })
})
