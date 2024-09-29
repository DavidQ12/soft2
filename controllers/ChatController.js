document.addEventListener('DOMContentLoaded', function() {
    const chatList = document.getElementById('chatList');
    const chatBox = document.getElementById('chatBox');
    const chatHeader = document.getElementById('chatHeader');
    const chatContent = document.getElementById('chatContent');
    const form = document.getElementById('chatForm');
    const fileInput = document.getElementById('fileInput');
    const messageInput = form.querySelector('textarea');
    
    const socket = io.connect('http://localhost:3000');
    
    let currentChatId = null;
    const userId = getUserId(); // Función que retorna el ID del usuario actual
  
    // Unirse a la sala del usuario actual
    socket.emit('joinChat', { userId });
  
    // Inicializar lista de chats
    function initChatList() {
      // Código para inicializar la lista de chats aquí
      // ...
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
  
        // Enviar mensaje al servidor
        socket.emit('send_message', {
          emisor_id: userId, // Debes implementar getUserId() para obtener el ID del usuario actual
          receptor_id: currentChatId,
          contenido: messageText
        });
  
        // Limpiar formulario
        form.reset();
      }
    });
  
    // Crear mensaje
    function createMessage(senderType, text, imageFile) {
      const message = {
        senderType,
        text,
        imageUrl: imageFile ? URL.createObjectURL(imageFile) : null,
        date: new Date()
      };
      return message;
    }
  
    // Agregar mensaje al chatbox
    function appendMessageToChatBox(message) {
      const messageElement = document.createElement('div');
      messageElement.textContent = `${message.senderType}: ${message.text}`;
      chatContent.appendChild(messageElement);
    }
  
    // Guardar mensaje en localStorage
    function saveMessage(message) {
      let messages = JSON.parse(localStorage.getItem(`chat_${currentChatId}`)) || [];
      messages.push(message);
      localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(messages));
    }
  
    // Recibir mensajes del servidor
    socket.on('receive_message', (message) => {
      if (currentChatId === message.emisor_id || currentChatId === message.receptor_id) {
        appendMessageToChatBox({
          senderType: 'receiver',
          text: message.contenido
        });
      }
    });
  
    // Inicializar la aplicación
    initChatList();
  });
  
