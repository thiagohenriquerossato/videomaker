const readline = require('readline-sync')
const state = require('./state.js')


function robot(){
    const content ={
        maximumSentences: 7
    }

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    state.save(content)

    function askAndReturnSearchTerm(){
        return readline.question('Type a Wikipedia search term: ')
    }
    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrfixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
        const selectedPrefixText = prefixes[selectedPrfixIndex]
        return selectedPrefixText
    }
}

module.exports = robot