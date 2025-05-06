const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

if (fs.existsSync('out')) {
  console.log('Eliminando carpeta out anterior...')
  fs.rmSync('out', { recursive: true, force: true })
}

console.log('Compilando proyecto...')
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error al compilar: ${error}`)
    return
  }

  console.log('Compilación completada')

  fs.writeFileSync(path.join('out', '.nojekyll'), '')
  console.log('Archivo .nojekyll creado')

  console.log('Desplegando a GitHub Pages...')
  exec('npx gh-pages -d out -t true', (deployError, deployStdout, deployStderr) => {
    if (deployError) {
      console.error(`Error al desplegar: ${deployError}`)
      return
    }
    console.log('Despliegue completado con éxito')
  })
})
