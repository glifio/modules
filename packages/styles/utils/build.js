const fs = require('fs')
const path = require('path')
const postcss = require('postcss')
const url = require('postcss-url')

const normalizeCssPath = 'node_modules/normalize.css/normalize.css'
const normalizeCss = fs.readFileSync(normalizeCssPath, 'utf8')
const stylesCssPath = 'src/css/styles.css'
const stylesCss = fs.readFileSync(stylesCssPath, 'utf8')
const outputPath = 'dist/index.css'
const outputDir = path.dirname(outputPath);

postcss()
  .use(url({
    url: 'inline',
    encodeType: 'base64'
  }))
  .process(stylesCss, {
    from: stylesCssPath,
    to: outputPath
  })
  .then(result => {
    const output = 
      getCssHeader('Normalize CSS') +
      normalizeCss +
      getCssHeader('GLIF styles CSS') +
      result.css

    if (fs.existsSync(outputDir))
      fs.rmSync(outputDir, { recursive: true, force: true })

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, output, { encoding: 'utf8' })
  })
  .catch(error => {
    console.error('Failed to process CSS', error)
  })

const getCssHeader = title => `
/*
* ${title}
*/

`
