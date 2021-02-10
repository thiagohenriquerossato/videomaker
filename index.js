const readline = require('readline-sync')
const robot = require('./robots/text.js')
const robots = {
    text: require('./robots/text.js')
}
async function start(){
    const content ={
        maximumSentences: 7
    }
    console.log('iniciando')

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    await robots.text(content)

    function askAndReturnSearchTerm(){
        return readline.question('Type a Wikipedia search term: ')
    }
    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrfixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
        const selectedPrefixText = prefixes[selectedPrfixIndex]
        return selectedPrefixText
    }
    console.log(JSON.stringify(content, null, 4))
}

start()