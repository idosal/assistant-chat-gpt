import archiver from 'archiver'
import esbuild from 'esbuild'
import fs from 'fs'
import {sassPlugin} from 'esbuild-sass-plugin'

const outdir = 'build'

async function deleteOldDir() {
  fs.rmSync(outdir, { recursive: true, force: true })
}

async function runEsbuild() {
  await esbuild.build({
    entryPoints: [
      'src/content/index.mjs',
      // 'src/content/audio.mjs',
      'src/popup/index.mjs',
      'src/background/index.mjs',
    ],
    loader: { '.css': 'text' },
    jsx: 'automatic',
    plugins: [sassPlugin()],
    bundle: true,
    minify: true,
    outdir: outdir,
  })
}

async function zipFiles(entryPoints, outfile) {
  const output = fs.createWriteStream(outfile)
  const archive = archiver('zip', {
    zlib: { level: 9 },
  })
  archive.pipe(output)
  for (const entryPoint of entryPoints) {
    archive.file(entryPoint.src, { name: entryPoint.dst })
  }
  await archive.finalize()
}

async function build() {
  await deleteOldDir()
  await runEsbuild()

  const commonFiles = [
    { src: 'build/background/index.js', dst: 'background/index.js' },
    { src: 'src/content/index.html', dst: 'content/index.html' },
    { src: 'build/content/index.js', dst: 'content/index.js' },
    { src: 'build/content/index.css', dst: 'content/index.css' },
    { src: 'src/popup/index.html', dst: 'popup/index.html' },
    { src: 'build/popup/index.js', dst: 'popup/index.js' },
    { src: 'build/popup/index.css', dst: 'popup/index.css' },
    { src: 'src/styles.css', dst: 'styles.css' },
    { src: 'src/assets/logo.png', dst: 'assets/logo.png' },
    { src: 'src/assets/logo_recording.png', dst: 'assets/logo_recording.png' },
    { src: 'src/assets/logo_handling.png', dst: 'assets/logo_handling.png' },
  ]

  // chromium
  await zipFiles(
    [...commonFiles, { src: 'src/manifest.json', dst: 'manifest.json' }],
    `./${outdir}/chrome.zip`
  )

  // firefox
  // await zipFiles(
  //   [...commonFiles, { src: 'src/manifest.json', dst: 'manifest.json' }],
  //   `./${outdir}/firefox.zip`,
  // )
}

build()
