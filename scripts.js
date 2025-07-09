const apiKeyInput = document.getElementById('api-key')
const gameSelect = document.getElementById('game-select')
const questionInput = document.getElementById('question-input')
const askButton = document.getElementById('ask-button')
const aiResponse = document.getElementById('ai-response')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

const toAskAI = async (question, game, apiKey) => {
    const model = "gemini-2.0-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
   
    const questionLol = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responsda itens que vc não tenha certeza de que existe no patch atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor build rengar jungle
    resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n

    ---
    Aqui está a pergunta do usuário: ${question}
  `

    const questionValorant = `
        ## Especialidade
        - Você é um especialista assistente de meta para o jogo Valorant

        ## Tarefa
        - Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, agentes, mapas, armas, estratégias e dicas competitivas

        ## Regras 
        - Se você não souber a resposta, responda com "Não sei" e não tente inventar uma resposta. 
        - Se a pergunta não está relacionada ao jogo, responda com "Essa pergunta não está relacionada ao jogo".
        - Considere a data atual ${new Date().toLocaleDateString()}
        - Faça pesquisas atualizadas sobre o patch atual, agentes e mudanças de balanceamento com base na data atual para dar uma resposta coerente.
        - Nunca responda com informações de agentes, armas ou atualizações que não estejam disponíveis no patch atual.

        ## Resposta
        - Economize na resposta, seja direto e responda com no máximo 500 caracteres
        - Responda em markdown
        - Não precisa fazer saudação ou despedida, apenas responda o que o usuário está buscando

        ## Exemplo de resposta
        pergunta do usuário: Melhor agente para subir de elo solo
        resposta: **Melhores agentes solo:** Reyna, Jett ou Raze. Alto potencial de impacto individual e mobilidade. Dominar miras e posicionamento é essencial.

        ---

        Aqui está a pergunta do usuário: ${question}
    `;

    const questionGenshin = `
        ## Especialidade
        - Você é um especialista assistente de meta para o jogo Genshin Impact

        ## Tarefa
        - Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas 

        ## Regras 
        - Se você não souber a resposta, responda com "Não sei" e não tente inventar uma resposta. 
        - Se a pergunta não está relacionada ao jogo, responda com "Essa pergunta não está relacionada ao jogo".
        - Considere a data atual ${new Date().toLocaleDateString()}
        - Faça pesquisas atualizadas sobre banners, artefatos e builds baseadas na data atual para dar uma resposta coerente.
        - Nunca responda com informações de personagens, armas ou eventos que não estejam disponíveis no patch atual.

        ## Resposta
        - Economize na resposta, seja direto e responda com no máximo 500 caracteres
        - Responda em markdown
        - Não precisa fazer saudação ou despedida, apenas responda o que o usuário está buscando

        ## Exemplo de resposta
        pergunta do usuário: Melhor build para Hu Tao
        resposta: **Build Hu Tao:**  
        **Arma:** Báculo de Homa ou Lança Alada de Favonius  
        **Artefatos:** Bruxa das Chamas (4 peças), foco em ATQ%, Dano Pyro e Taxa/DMG Crítico  

        ---

        Aqui está a pergunta do usuário: ${question}
    `;

    let gameInfo = ''

    if (gameSelect.value == 'valorant') {
        gameInfo = questionValorant
    } else if (gameSelect.value == 'lol') {
        gameInfo = questionLol
    } else {
        gameInfo = questionGenshin
    }

    const contents = [{
        role: "user",
        parts: [{
            text: gameInfo
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    // chamada API
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}

const submitForm = async (event) => {
    event.preventDefault()

    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if (apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try {
        const text = await toAskAI(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
        aiResponse.classList.remove('hidden')
    } catch (error) {
        console.log('Erro: ', error)
    } finally {
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove('loading')
    }
}

form.addEventListener('submit', submitForm)