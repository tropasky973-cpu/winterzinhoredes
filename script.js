document.addEventListener('DOMContentLoaded', () => {
    const discordForm = document.getElementById('discord-form');
    const sendButton = document.getElementById('send-button');
    const statusMessage = document.getElementById('status-message');
    const chatContainer = document.getElementById('live-chat-messages');

    // IMPORTANTE: Substitua a string abaixo pela URL do seu Webhook do Discord.
    // Para criar um webhook: Vá em Configurações do Servidor > Integrações > Webhooks > Novo Webhook
    const webhookURL = 'https://discord.com/api/webhooks/1409255241140015166/CoVTvIrnvT7nQq3Zg7q9LoRjxpaiQXTWtSda37LfOSc6iVMWQFjzwcndcipandElDCm-';

    if (!webhookURL || webhookURL === 'COLE_SUA_URL_DE_WEBHOOK_AQUI') {
        sendButton.disabled = true;
        sendButton.textContent = 'Webhook não configurado';
        statusMessage.textContent = 'Por favor, configure o URL do Webhook no arquivo script.js.';
        statusMessage.style.color = '#f04747'; // Error color
    }

    // --- Início: Lógica do Chat de Mensagens Enviadas ---

    const loadMessages = () => {
        const messages = JSON.parse(localStorage.getItem('sentMessages')) || [];
        messages.forEach(msg => addMessageToChat(msg.username, msg.message, msg.timestamp, false));
        scrollToBottom();
    };

    const saveMessage = (username, message, timestamp) => {
        const messages = JSON.parse(localStorage.getItem('sentMessages')) || [];
        messages.push({ username, message, timestamp });
        // Manter apenas as últimas 30 mensagens
        if (messages.length > 30) {
            messages.shift();
        }
        localStorage.setItem('sentMessages', JSON.stringify(messages));
    };

    const scrollToBottom = () => {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    };

    const addMessageToChat = (username, messageText, time, animate) => {
        if (!chatContainer) return;

        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        if (animate) {
             messageElement.style.animation = 'fadeIn 0.5s ease';
        }

        messageElement.innerHTML = `
            <div>
                <span class="author">${escapeHTML(username)}</span>
                <span class="timestamp">${time}</span>
            </div>
            <p class="content">${escapeHTML(messageText)}</p>
        `;
        
        chatContainer.appendChild(messageElement);

        if (chatContainer.children.length > 30) {
            chatContainer.removeChild(chatContainer.firstElementChild);
        }

        scrollToBottom();
    };

    const escapeHTML = (str) => {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    };

    loadMessages();

    // --- Fim: Lógica do Chat de Mensagens Enviadas ---

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
                const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                addMessageToChat(username, message, timestamp, true);
                saveMessage(username, message, timestamp);
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