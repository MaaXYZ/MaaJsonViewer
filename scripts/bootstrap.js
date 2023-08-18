const { spawn } = require('child_process')
const { createWriteStream } = require('fs')
const { mkdir, readFile, rm, copyFile, cp } = require('fs/promises')
const { join, resolve } = require('path')
const { chdir } = require('process')
const { arch, platform } = require('os')

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

async function downloadTo(url, path) {
  const axios = require('axios')
  const writer = createWriteStream(path)

  return await axios({
    method: 'get',
    url,
    responseType: 'stream',
    proxy: {
      protocol: 'http',
      host: '127.0.0.1',
      port: 7890
    }
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

const archMapper = {
  x64: 'x86_64',
  arm64: 'aarch64'
}

const platMapper = {
  win32: 'win',
  linux: 'linux',
  darwin: 'macos'
}

async function main() {
  const version = JSON.parse(await readFile('package.json', 'utf-8')).version
  const frameworkVersion = '0.3.6'

  const ar = archMapper[arch()]
  const os = platMapper[platform()]

  console.log(`${os}-${ar}`)

  if (!ar || !os) {
    console.log(`platform ${platform()} arch ${arch()} not supported`)
    return
  }

  const envUrl = `https://github.com/MaaAssistantArknights/MaaJsonViewer/releases/download/v${version}/MaaJsonViewer-env-v${version}.zip`
  const frameworkUrl = `https://github.com/MaaAssistantArknights/MaaFramework/releases/download/v${frameworkVersion}/MAA-${os}-${ar}-v${frameworkVersion}.zip`
  const targetDir = join('.', 'running')
  const libraryDir = join(targetDir, 'library')

  console.log('update submodules')
  await new Promise(resolve => {
    spawn('git', ['submodule', 'update', '--init', '--recursive'], {
      stdio: 'inherit',
      shell: true
    }).addListener('close', resolve)
  })
  chdir('packages/MaaJSLoader')
  await new Promise(resolve => {
    spawn('git', ['checkout', 'main'], {
      stdio: 'inherit',
      shell: true
    }).addListener('close', resolve)
  })
  chdir('../..')

  console.log('install node modules')
  await new Promise(resolve => {
    spawn('npm', ['install'], {
      stdio: 'inherit',
      shell: true
    }).addListener('close', resolve)
  })

  await mkdir(libraryDir, { recursive: true })
  const extract = require('extract-zip')

  console.log('download', envUrl)
  const releasePath = 'release.zip'
  await downloadTo(envUrl, releasePath)
  await extract(releasePath, {
    dir: resolve(targetDir)
  })

  console.log('download', frameworkUrl)
  const frameworkPath = 'framework.zip'
  await downloadTo(frameworkUrl, frameworkPath)
  const extractPath = join(targetDir, 'library', 'maaframework', 'install')
  await extract(frameworkPath, {
    dir: resolve(extractPath)
  })
  await cp(
    join(extractPath, 'bin'),
    join(targetDir, 'library', 'maaframework', 'bin'),
    {
      recursive: true
    }
  )
  await rm(extractPath, {
    recursive: true
  })
}

main()
