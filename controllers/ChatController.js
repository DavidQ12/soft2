document.addEventListener('DOMContentLoaded', function() {
  const chatList = document.getElementById('chatList');
  const chatHeader = document.getElementById('chatHeader');
  const chatContent = document.getElementById('chatContent');
  const form = document.getElementById('chatForm');
  const fileInput = document.getElementById('fileInput');
  const messageInput = form.querySelector('textarea');
  const recordButton = document.getElementById('recordButton'); // Botón para grabar audio

  const socket = io.connect('http://localhost:3000');
  let currentChatId = null;
  const userId = getUserId(); // Función que retorna el ID del usuario actual

  // Inicializar grabación de audio
  let mediaRecorder;
  let audioChunks = [];

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

  // Manejar envío de mensajes de texto e imagen
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
    if (message.imageUrl) {
      const img = document.createElement('img');
      img.src = message.imageUrl;
      img.alt = 'Imagen enviada';
      messageElement.appendChild(img);
    }
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

  // Manejar grabación de audio
  recordButton.addEventListener('click', async () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      
      mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Guardar el audio en localStorage
        saveAudioLocally(audioUrl);

        // Reproducir el audio
        const audioPlayer = document.createElement('audio');
        audioPlayer.controls = true;
        audioPlayer.src = audioUrl;
        chatContent.appendChild(audioPlayer); // Añadir al chat

        audioChunks = [];
      });

      recordButton.innerText = 'Detener Grabación';
    } else {
      mediaRecorder.stop();
      recordButton.innerText = 'Grabar Audio';
    }
  });

  // Función para guardar el audio en localStorage (opcional)
  function saveAudioLocally(audioUrl) {
    let savedAudios = JSON.parse(localStorage.getItem('savedAudios')) || [];
    savedAudios.push(audioUrl);
    localStorage.setItem('savedAudios', JSON.stringify(savedAudios));
  }

  // Inicializar la aplicación
  initChatList();
});
