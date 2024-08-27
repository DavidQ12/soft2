document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const chatBox = document.querySelector('.chat-box');
    const messageInput = form.querySelector('textarea');
    const imageInput = form.querySelector('input[type="file"]');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(form);

        if (messageInput.value.trim() || imageInput.files.length > 0) {
            const userMessage = createUserMessage(formData);
            appendMessageToChatBox(userMessage);

            setTimeout(function() {
                const simulatedResponse = generateSimulatedResponse(messageInput.value.trim());
                appendMessageToChatBox(simulatedResponse);
            }, 1000);

            form.reset();
        }
    });

    function createUserMessage(formData) {
        const messageText = formData.get('message');
        const imageFile = formData.get('image');

        const message = document.createElement('div');
        message.classList.add('message', 'sender');

        if (messageText) {
            const textElement = document.createElement('p');
            textElement.textContent = messageText;
            message.appendChild(textElement);
        }

        if (imageFile && imageFile.size > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageElement = document.createElement('img');
                imageElement.src = e.target.result;
                message.appendChild(imageElement);
            };
            reader.readAsDataURL(imageFile);
        }

        return message;
    }

    function generateSimulatedResponse(userMessage) {
        const normalizedMessage = userMessage.toLowerCase().trim();

        // Respuestas más lógicas y contextuales
        if (normalizedMessage.includes("hola") || normalizedMessage.includes("buenos días") || normalizedMessage.includes("buenas tardes") || normalizedMessage.includes("buenas noches")) {
            return createResponseMessage("¡Hola! ¿Cómo puedo ayudarte hoy?");
        } else if (normalizedMessage.includes("cómo estás") || normalizedMessage.includes("qué tal") || normalizedMessage.includes("cómo te va")) {
            return createResponseMessage("Estoy bien, gracias. ¿Y tú cómo estás?");
        } else if (normalizedMessage.includes("qué haces") || normalizedMessage.includes("qué estás haciendo")) {
            return createResponseMessage("Estoy aquí para ayudarte con cualquier pregunta que tengas. ¿En qué puedo asistirte?");
        } else if (normalizedMessage.includes("adiós") || normalizedMessage.includes("hasta luego") || normalizedMessage.includes("nos vemos")) {
            return createResponseMessage("¡Hasta luego! Espero que tengas un buen día.");
        } else if (normalizedMessage.includes("gracias") || normalizedMessage.includes("te lo agradezco")) {
            return createResponseMessage("¡De nada! Si necesitas algo más, no dudes en decírmelo.");
        } else if (normalizedMessage.includes("cuánto es") || normalizedMessage.includes("qué hora es") || normalizedMessage.includes("dime la hora")) {
            return createResponseMessage("Lo siento, no puedo decirte la hora en este momento.");
        } else if (normalizedMessage.includes("dónde estás") || normalizedMessage.includes("dónde te encuentras")) {
            return createResponseMessage("Estoy en el servidor, aquí para ayudarte con tus consultas.");
        } else if (normalizedMessage.includes("qué es") || normalizedMessage.includes("cómo se hace") || normalizedMessage.includes("cómo funciona")) {
            return createResponseMessage("Eso depende del contexto. ¿Puedes especificar más?");
        } else {
            return createResponseMessage("No estoy seguro de cómo responder a eso. ¿Puedes darme más detalles?");
        }
    }

    function createResponseMessage(responseText) {
        const message = document.createElement('div');
        message.classList.add('message', 'receiver');

        const textElement = document.createElement('p');
        textElement.textContent = responseText;
        message.appendChild(textElement);

        return message;
    }

    function appendMessageToChatBox(message) {
        chatBox.appendChild(message);
        chatBox.scrollTop = chatBox.scrollHeight; // Desplazar hacia abajo
    }
});


