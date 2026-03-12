import * as fs from "node:fs"
import { join } from "node:path"

export function getPackageRoot(importMetaDir: string): string {
  return join(importMetaDir, "../..")
}

export function getDistRoot(importMetaDir: string): string {
  return join(getPackageRoot(importMetaDir), "dist")
}

export function getDistIndexPath(distRoot: string): string {
  return join(distRoot, "index.html")
}

export type BuildUiResult = {
  success: boolean
}

export async function ensureUiAssets(opts: {
  packageRoot: string
  distRoot: string
  buildUi?: (packageRoot: string) => Promise<BuildUiResult> | BuildUiResult
}): Promise<void> {
  if (fs.existsSync(getDistIndexPath(opts.distRoot))) return

  const buildUi = opts.buildUi ?? buildUiAssets
  const result = await buildUi(opts.packageRoot)

  if (!result.success || !fs.existsSync(getDistIndexPath(opts.distRoot))) {
    throw new Error("Dashboard UI build failed: dist/index.html is missing")
  }
}

async function buildUiAssets(packageRoot: string): Promise<BuildUiResult> {
  const proc = Bun.spawnSync(["bun", "run", "build:ui"], {
    cwd: packageRoot,
    stdout: "inherit",
    stderr: "inherit",
  })

  return { success: proc.exitCode === 0 }
}
