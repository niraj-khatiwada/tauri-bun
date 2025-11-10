/** biome-ignore-all lint/suspicious/noConsole: <> */

/**
 * Compile the packages/server to use as a sidecar in Tauri
 */
import path from 'node:path'
import { $ } from 'bun'

import packageJson from '../../../package.json'

const ARCHITECTURES = {
  x64: 'x64',
  arm64: 'aarch64',
} as const

const BINARIES_POSTFIX: Record<
  string,
  Record<keyof typeof ARCHITECTURES, string>
> = {
  darwin: {
    x64: 'x86_64-apple-darwin',
    arm64: 'aarch64-apple-darwin',
  },
  linux: {
    x64: 'x86_64-unknown-linux-gnu',
    arm64: 'aarch64-unknown-linux-gnu',
  },
  win32: {
    x64: 'x86_64-pc-windows-msvc.exe',
    arm64: 'i686-pc-windows-msvc.exe',
  },
} as const

const BINARY_NAME = `${packageJson.name}-sidecar`
const OUTDIR = path.join(__dirname, '..', '..', '..', 'tauri', 'bin')
const OUTFILE = `${OUTDIR}/${BINARY_NAME}-{binary_postfix}`

async function main() {
  const os = process.platform as keyof typeof BINARIES_POSTFIX
  const arch = process.arch as keyof typeof ARCHITECTURES

  const binary_postfix = BINARIES_POSTFIX[os]?.[arch]

  if (!binary_postfix) {
    throw new Error(
      `Could not find the binary label for OS="${os}" ARCHITECTURE="{arch}"`,
    )
  }

  const outfile = OUTFILE.replace('{binary_postfix}', binary_postfix)

  console.log(`\x1b[36mDetected:\x1b[0m ${os} (\x1b[33m${arch}\x1b[0m)`)
  console.log(`\x1b[36mOutput binary:\x1b[0m ${outfile}`)

  console.log('\x1b[34mCompiling server with Bun...\x1b[0m')
  await $`bun build --compile --production --minify --minify-syntax --target bun --bytecode --bundle ./src/index.ts --outfile ${outfile}`

  console.log('\x1b[32mDone! Binary created at:\x1b[0m', outfile)
}

main().catch((err) => {
  console.error('Build failed:', err)
  process.exit(1)
})
