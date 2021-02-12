const google = require ('googleapis').google
const imageDownloader = require('image-downloader')
const customSearch =  google.customsearch('v1')
const state = require('./state.js')
const apiKey = require('../credentials/google-search.json').apiKey
const searchEngineId = require('../credentials/google-search.json').searchEngineId2




async function robot(){
    const content = state.load()
    await fetchImagesOfAllSentences(content)
    state.save(content)
    await downloadAllImages(content)

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
    
    async function downloadAllImages(content){
        content.downloadedImages = []
        for(let sentenceIndex = 0; sentenceIndex<content.sentences.length; sentenceIndex++){
            const images = content.sentences[sentenceIndex].images
            
            for(let imageIndex = 0; imageIndex<images.length; imageIndex++){
                const imagesUrl = images[imageIndex]

                try{
                    if(content.downloadedImages.includes(imagesUrl)){
                        throw new Error('Imagem ja foi baixada')
                    }
                    await downloadAndSave(imagesUrl, `${sentenceIndex}-original.png`)
                    console.log(`>Baixou com sucesso: ${imagesUrl}`)
                    break
                }catch(error){
                    console.log(`>Erro ao baixar: (${imagesUrl}): ${error}`)

                }

                async function downloadAndSave(url, fileName){
                    return imageDownloader.image({
                        url, url,
                        dest:`./content/${fileName}` 
                    })
                }
            }
        }
    }
    
}

module.exports = robot