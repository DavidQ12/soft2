document.addEventListener('DOMContentLoaded', function() {
    const chatList = document.getElementById('chatList');
    const chatBox = document.getElementById('chatBox');
    const chatHeader = document.getElementById('chatHeader');
    const chatContent = document.getElementById('chatContent');
    const form = document.getElementById('chatForm');
    const fileInput = document.getElementById('fileInput');
    const messageInput = form.querySelector('textarea');

    const conversations = [
        { id: 1, name: "David Ernesto Quintanilla Segovia", preview: "¡Hola! ¿Cómo estás?", image: "images/David_foto.jpeg" },
        { id: 2, name: "Luis Francisco Pleitez Quintanilla", preview: "¿Listo para el proyecto?", image: "images/pleitez_foto.jpg" },
        { id: 3, name: "Patrick Jeremi Orellana Menjívar", preview: "¿Viste el partido ayer?", image: "images/patrick_foto.jpg" }
    ];

    let currentChatId = null;

    // Inicializar lista de chats
    function initChatList() {
        conversations.forEach(convo => {
            const chatItem = document.createElement('div');
            chatItem.classList.add('chat-item');
            chatItem.dataset.id = convo.id;

            const avatar = document.createElement('img');
            avatar.src = convo.image;
            chatItem.appendChild(avatar);

            const info = document.createElement('div');
            info.classList.add('info');

            const name = document.createElement('div');
            name.classList.add('name');
            name.textContent = convo.name;
            info.appendChild(name);

            const preview = document.createElement('div');
            preview.classList.add('preview');
            preview.textContent = convo.preview;
            info.appendChild(preview);

            chatItem.appendChild(info);
            chatList.appendChild(chatItem);

            chatItem.addEventListener('click', function() {
                openChat(convo.id);
            });
        });
    }

    // Abrir chat seleccionado
    function openChat(id) {
        currentChatId = id;
        const selectedConvo = conversations.find(convo => convo.id === id);
        chatHeader.innerHTML = `<img src="${selectedConvo.image}" alt="${selectedConvo.name}">${selectedConvo.name}`;
        form.style.display = 'flex';
        chatContent.innerHTML = '';

        // Cargar mensajes almacenados
        const storedMessages = JSON.parse(localStorage.getItem(`chat_${id}`)) || [];
        storedMessages.forEach(msg => {
            appendMessageToChatBox(msg);
        });
    }

    // Manejar envío de mensajes
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const messageText = messageInput.value.trim();
        const imageFile = fileInput.files[0];

        if (messageText || imageFile) {
            const message = createMessage('sender', messageText, imageFile);
            appendMessageToChatBox(message);
            saveMessage(message);

            // Limpiar formulario
            form.reset();

            // Simular respuesta
            setTimeout(() => {
                const response = generateSimulatedResponse(messageText);
                appendMessageToChatBox(response);
                saveMessage(response);
            }, 1000);
        }
    });

    // Crear mensaje
    function createMessage(senderType, text, imageFile) {
        const message = {
            id: Date.now(),
            sender: senderType,
            text: text || '',
            image: null,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            editable: senderType === 'sender'
        };

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                message.image = e.target.result;
                updateLastMessagePreview(message);
                renderMessage(message);
            };
            reader.readAsDataURL(imageFile);
        } else {
            updateLastMessagePreview(message);
            renderMessage(message);
        }

        return message;
    }

    // Actualizar preview del último mensaje
    function updateLastMessagePreview(message) {
        const chatItem = chatList.querySelector(`[data-id='${currentChatId}'] .preview`);
        if (message.text) {
            chatItem.textContent = message.text;
        } else if (message.image) {
            chatItem.textContent = 'Imagen enviada';
        }
    }

    // Renderizar mensaje en el chat
    function renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', message.sender);
        messageElement.dataset.id = message.id;

        if (message.text) {
            const textElement = document.createElement('p');
            textElement.textContent = message.text;
            messageElement.appendChild(textElement);
        }

        if (message.image) {
            const imageElement = document.createElement('img');
            imageElement.src = message.image;
            messageElement.appendChild(imageElement);
        }

        const timeElement = document.createElement('span');
        timeElement.classList.add('timestamp');
        timeElement.textContent = message.time;
        messageElement.appendChild(timeElement);

        if (message.editable) {
            const editButton = document.createElement('button');
            editButton.classList.add('edit-btn');
            editButton.textContent = 'Editar';
            editButton.addEventListener('click', () => enableMessageEditing(messageElement, message));
            messageElement.appendChild(editButton);

            // Ocultar botón de edición después de 2 minutos
            setTimeout(() => {
                editButton.style.display = 'none';
                message.editable = false;
                updateStoredMessage(message);
            }, 120000);
        }

        chatContent.appendChild(messageElement);
        chatContent.scrollTop = chatContent.scrollHeight;
    }

    // Agregar mensaje al chatbox
    function appendMessageToChatBox(message) {
        if (message.image && !message.text) {
            renderMessage(message);
        } else if (!message.image) {
            renderMessage(message);
        }
    }

    // Habilitar edición de mensaje
    function enableMessageEditing(messageElement, message) {
        const textElement = messageElement.querySelector('p');
        if (!textElement) return;

        const editTextarea = document.createElement('textarea');
        editTextarea.classList.add('edit-textarea');
        editTextarea.value = message.text;
        messageElement.replaceChild(editTextarea, textElement);

        const editButton = messageElement.querySelector('.edit-btn');
        editButton.textContent = 'Guardar';
        editButton.removeEventListener('click', () => enableMessageEditing(messageElement, message));
        editButton.addEventListener('click', () => saveEditedMessage(messageElement, message, editTextarea, editButton));
    }

    // Guardar mensaje editado
    function saveEditedMessage(messageElement, message, editTextarea, editButton) {
        const newText = editTextarea.value.trim();
        if (newText) {
            message.text = newText;
            const newTextElement = document.createElement('p');
            newTextElement.textContent = newText;
            messageElement.replaceChild(newTextElement, editTextarea);

            editButton.textContent = 'Editar';
            editButton.removeEventListener('click', () => saveEditedMessage(messageElement, message, editTextarea, editButton));
            editButton.addEventListener('click', () => enableMessageEditing(messageElement, message));

            updateStoredMessage(message);
            updateLastMessagePreview(message);
        }
    }

    // Guardar mensaje en localStorage
    function saveMessage(message) {
        let messages = JSON.parse(localStorage.getItem(`chat_${currentChatId}`)) || [];
        messages.push(message);
        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(messages));
    }

    // Actualizar mensaje en localStorage
    function updateStoredMessage(updatedMessage) {
        let messages = JSON.parse(localStorage.getItem(`chat_${currentChatId}`)) || [];
        messages = messages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg);
        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(messages));
    }

    // Generar respuesta simulada
    function generateSimulatedResponse(userMessage) {
        const responses = [
            "Interesante, cuéntame más.",
            "No estaba al tanto, gracias por la info.",
            "¡Eso suena genial!",
            "¿Puedes explicarme un poco más sobre eso?",
            "Estoy de acuerdo contigo.",
            "Eso es muy útil, gracias."
        ];
        return createMessage('receiver', responses[Math.floor(Math.random() * responses.length)]);
    }

    // Inicializar la aplicación
    initChatList();
});




