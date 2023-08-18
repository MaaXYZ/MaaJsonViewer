const { spawn } = require('child_process')
const { createWriteStream } = require('fs')
const { mkdir, readFile, rm, copyFile } = require('fs/promises')
const { join, resolve } = require('path')
const { chdir } = require('process')

// fs.copyFile(
//   './packages/server/assets/config.develop.json',
//   './packages/server/config.json'
// )
// fs.copyFile('./packages/server/assets/init.zip', './packages/server/saves.zip')
// fs.mkdir('./packages/server/library/maaframework', { recursive: true })
// fs.mkdir('./packages/server/library/maaframework/bin', { recursive: true })
// fs.mkdir('./packages/server/library/maaframework/MaaAgentBinary', {
//   recursive: true
// })
// fs.mkdir('./packages/server/library/maaframework/model', { recursive: true })
// fs.copyFile(
//   './packages/server/assets/controller_config.json',
//   './packages/server/library/maaframework/controller_config.json'
// )

async function main() {
  const version = JSON.parse(await readFile('package.json', 'utf-8')).version
  const url = `https://github.com/MaaAssistantArknights/MaaJsonViewer/releases/download/v${version}/MaaJsonViewer-win-v${version}.zip`
  const targetDir = join('.', 'running')
  const libraryDir = join(targetDir, 'library')

  console.log('update submodules')
  await new Promise(resolve => {
    spawn('git', ['submodule', 'update', '--init', '--recursive'], {
      stdio: 'inherit'
    }).addListener('close', resolve)
  })
  chdir('packages/MaaJSLoader')
  await new Promise(resolve => {
    spawn('git', ['checkout', 'main'], {
      stdio: 'inherit'
    }).addListener('close', resolve)
  })
  chdir('../..')

  console.log('install node modules')
  await new Promise(resolve => {
    spawn('npm', ['install'], {
      stdio: 'inherit'
    }).addListener('close', resolve)
  })

  await mkdir(libraryDir, { recursive: true })
  console.log('download', url)
  const releasePath = 'release.zip'
  {
    const axios = require('axios')
    const writer = createWriteStream(releasePath)

    await axios({
      method: 'get',
      url,
      responseType: 'stream'
    }).then(response => {
      return new Promise((resolve, reject) => {
        response.data.pipe(writer)
        let error = null
        writer.on('error', err => {
          error = err
          writer.close()
          reject(err)
        })
        writer.on('close', () => {
          if (!error) {
            resolve(true)
          }
        })
      })
    })
  }

  const extract = require('extract-zip')
  await extract(releasePath, {
    dir: resolve(targetDir)
  })

  console.log('clean')
  await rm(join(targetDir, 'server.exe'))
}

main()
