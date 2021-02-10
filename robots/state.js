const fs = require('fs')
const contentFilePath = './content.json'

function save(content){
    const contentStrig = JSON.stringify(content)
    return fs.writeFileSync(contentFilePath,contentStrig)
}

function load(){
    const fileBuffer = fs.readFileSync(contentFilePath,'utf-8')
    const contentJson = JSON.parse(fileBuffer)
    return contentJson
}

module.exports = {
    save,
    load
}