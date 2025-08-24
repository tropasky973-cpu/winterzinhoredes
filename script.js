document.addEventListener('DOMContentLoaded', () => {
    const discordForm = document.getElementById('discord-form');
    const sendButton = document.getElementById('send-button');
    const statusMessage = document.getElementById('status-message');

    // IMPORTANTE: Substitua a string abaixo pela URL do seu Webhook do Discord.
    // Para criar um webhook: Vá em Configurações do Servidor > Integrações > Webhooks > Novo Webhook
    const webhookURL = 'https://discord.com/api/webhooks/1409255241140015166/CoVTvIrnvT7nQq3Zg7q9LoRjxpaiQXTWtSda37LfOSc6iVMWQFjzwcndcipandElDCm-';

    if (!webhookURL || webhookURL === 'COLE_SUA_URL_DE_WEBHOOK_AQUI') {
        sendButton.disabled = true;
        sendButton.textContent = 'Webhook não configurado';
        statusMessage.textContent = 'Por favor, configure o URL do Webhook no arquivo script.js.';
        statusMessage.style.color = '#f04747'; // Error color
    }

    discordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!username || !message) {
            showStatus('Por favor, preencha todos os campos.', 'error');
            return;
        }

        sendButton.disabled = true;
        sendButton.textContent = 'Enviando...';
        showStatus('', 'info');

        try {
            const payload = {
                username: username,
                content: message,
                // Você pode adicionar um avatar aqui se quiser
                // avatar_url: "URL_DA_IMAGEM_DO_AVATAR" 
            };

            const response = await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                showStatus('Mensagem enviada com sucesso!', 'success');
                document.getElementById('message').value = '';
            } else {
                const errorData = await response.json();
                console.error('Erro do Discord:', errorData);
                showStatus(`Erro ao enviar mensagem: ${response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            showStatus('Ocorreu um erro. Tente novamente.', 'error');
        } finally {
            sendButton.disabled = false;
            sendButton.textContent = 'Enviar Mensagem';
        }
    });

    function showStatus(message, type) {
        statusMessage.textContent = message;
        if (type === 'success') {
            statusMessage.style.color = '#43b581';
        } else if (type === 'error') {
            statusMessage.style.color = '#f04747';
        } else {
            statusMessage.style.color = '#99aab5';
        }
    }

    // --- Início da Simulação de Chat ao Vivo ---
    const chatContainer = document.getElementById('live-chat-messages');
    if (chatContainer) {
        const sampleUsers = ['MestreCuca', 'GamerX', 'DJ_Sonico', 'PixelArtLover', 'MemeLord', 'AnaCodista', 'Zek', 'LuaNerd'];
        const sampleMessages = [
            'Olá pessoal, tudo bem?',
            'Alguém afim de jogar hoje à noite?',
            'Acabei de ver o novo anúncio, que incrível!',
            'KKKKKKKKKK muito bom esse meme que postaram',
            'Qual a boa de hoje?',
            'Recomendo muito essa música nova que saiu.',
            'Estou trabalhando num projeto novo, em breve mostro pra vocês!',
            'O servidor está muito legal!',
            'A comunidade aqui é a melhor <3',
            'Cheguei! Perdi alguma coisa?',
            'Vamos organizar um campeonato?',
            'Alguém me ajuda com uma dúvida de programação?'
        ];

        const addSimulatedMessage = () => {
            if (document.hidden) return; // Pausa a simulação se a aba não estiver visível

            const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
            const messageText = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
            const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message');

            messageElement.innerHTML = `
                <div>
                    <span class="author">${user}</span>
                    <span class="timestamp">${time}</span>
                </div>
                <p class="content">${messageText}</p>
            `;

            const isScrolledToBottom = chatContainer.scrollHeight - chatContainer.clientHeight <= chatContainer.scrollTop + 1;

            chatContainer.appendChild(messageElement);

            if (isScrolledToBottom) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }

            if (chatContainer.children.length > 30) {
                chatContainer.removeChild(chatContainer.firstElementChild);
            }
        };
        
        // Adiciona algumas mensagens iniciais para preencher o chat
        for (let i = 0; i < 7; i++) {
            setTimeout(addSimulatedMessage, i * 300);
        }

        // Adiciona uma nova mensagem em intervalos aleatórios para parecer mais natural
        const scheduleNextMessage = () => {
            const randomInterval = Math.random() * 4000 + 2000; // entre 2 e 6 segundos
            setTimeout(() => {
                addSimulatedMessage();
                scheduleNextMessage();
            }, randomInterval);
        };
        scheduleNextMessage();
    }
    // --- Fim da Simulação de Chat ao Vivo ---

    // Funcionalidade de Download do ZIP
    const downloadBtn = document.getElementById('download-zip-btn');
    downloadBtn.addEventListener('click', async () => {
        if (typeof JSZip === 'undefined') {
            alert('Erro: Biblioteca de compressão não foi carregada.');
            return;
        }

        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando pacote...';
        downloadBtn.disabled = true;

        try {
            const zip = new JSZip();

            // Lista de arquivos para adicionar ao ZIP
            const filesToZip = [
                'index.html',
                'style.css',
                'script.js',
                'background.png',
                'avatar.png'
            ];

            const fetchPromises = filesToZip.map(fileUrl => {
                return fetch(fileUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Não foi possível baixar ${fileUrl}`);
                        }
                        // Tratar como blob para imagens, texto para o resto
                        const isImage = fileUrl.endsWith('.png');
                        return isImage ? response.blob() : response.text();
                    })
                    .then(data => ({ name: fileUrl, data }));
            });

            const files = await Promise.all(fetchPromises);

            files.forEach(file => {
                zip.file(file.name, file.data);
            });

            // Gerar e baixar o ZIP
            zip.generateAsync({ type: 'blob' }).then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'projeto-especiais.zip';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);

                downloadBtn.innerHTML = '<i class="fas fa-check"></i> Pacote criado!';
                setTimeout(() => {
                    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Baixar Arquivos do Projeto';
                    downloadBtn.disabled = false;
                }, 2000);
            });
        } catch (error) {
            console.error('Erro ao criar o arquivo ZIP:', error);
            alert('Ocorreu um erro ao criar o pacote de download.');
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Baixar Arquivos do Projeto';
            downloadBtn.disabled = false;
        }
    });
});