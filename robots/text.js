const algorithmia = require("algorithmia")
const sentenceBoundaryDetection = require('sbd')

const algoithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const watsonApiKey = require('../credentials/watson-nlu.json').apikey

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const nlu = new NaturalLanguageUnderstandingV1({
  authenticator: new IamAuthenticator({ apikey: watsonApiKey }),
  version: '2018-04-05',
  serviceUrl: 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com'
});

const state = require('./state.js')

async function robot(){
    const content = state.load()
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentenses(content)
    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)
    state.save(content)

    async function fetchContentFromWikipedia(content){
        const algorithmiaAuthenticated = algorithmia(algoithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2")
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponse.get()
        content.sourceContentOriginal = wikipediaContent.content
        console.log('pegando da wiki')

    }

    function sanitizeContent(content){
        const withoutBlankLinesAndMarkDown = removeBlankLinesAndMarkDown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkDown)
        content.sourceContentSanitized = withoutDatesInParentheses
        
        function removeBlankLinesAndMarkDown(text){
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkDown = allLines.filter((line) => {
                if(line.trim().length === 0 || line.trim().startsWith('=')){
                    return false
                }
                return true
            })
            return withoutBlankLinesAndMarkDown.join(' ')
        }  
        console.log('limpando conteudo')
         
    }

    function removeDatesInParentheses(text){
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }

    function breakContentIntoSentenses(content){
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images:[]
            })
        })
        console.log('separando em sentenças')

    }
    function limitMaximumSentences(content){
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeywordsOfAllSentences(content){
        for(const sentence of content.sentences){
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text) 
        }
        console.log('colocando keywords')
    }
    async function fetchWatsonAndReturnKeywords(sentence){
        return new Promise((resolve, reject)=> {
            nlu.analyze(
                {
                  html: sentence, // Buffer or String
                  features: {
                    keywords: {}
                  }
                })
                .then(response =>{
                    const keywords = response.result.keywords.map((keyword)=>{
                        return keyword.text
                    })
                    resolve(keywords)
                })
                .catch(err =>{
                    console.log('error: ',err)
                })
        })
        
    }

}
module.exports = robot