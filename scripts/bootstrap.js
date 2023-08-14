import fs from 'fs'

fs.copyFile(
  './packages/server/assets/config.develop.json',
  './packages/server/config.json'
)
fs.copyFile('./packages/server/assets/init.zip', './packages/server/saves.zip')
fs.mkdir('./packages/server/library/maaframework', { recursive: true })
fs.mkdir('./packages/server/library/maaframework/bin', { recursive: true })
fs.mkdir('./packages/server/library/maaframework/MaaAgentBinary', {
  recursive: true
})
fs.mkdir('./packages/server/library/maaframework/model', { recursive: true })
fs.copyFile(
  './packages/server/assets/controller_config.json',
  './packages/server/library/maaframework/controller_config.json'
)
