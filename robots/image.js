const google = require ('googleapis').google
const customSearch =  google.customsearch('v1')
const state = require('./state.js')
const apiKey = require('../credentials/google-search.json').apiKey
const searchEngineId = require('../credentials/google-search.json').searchEngineId2




async function robot(){
    const content = state.load()
    await fetchImagesOfAllSentences(content)
    state.save(content)
    async function fetchImagesOfAllSentences(content){
        for(const sentence of content.sentences) {
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await  fetchGoogleAndReturnImagensLinks(query)
            sentence.googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnImagensLinks(query){
        const response = await customSearch.cse.list({
            auth: apiKey,
            cx: searchEngineId,
            q: query,
            searchType: 'image',
            num: 2
        })
        const imagesUrl = response.data.items.map((item)=>{
            return item.link
        })
        return imagesUrl
    }
    
    
}

module.exports = robot