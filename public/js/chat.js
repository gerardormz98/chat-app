const socket = io();

// Elements
const $frmChat = document.getElementById('message-form');
const $txtMessage = document.getElementById('txtMessage');
const $btnSend = document.getElementById('btnSend');
const $btnShareLocation = document.getElementById('btnShareLocation');
const $messages = document.getElementById('messages');
const $sidebar = document.getElementById('sidebar');

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

let isAutoscrollEnabled = true;

const autoscroll = () => {
    if (isAutoscrollEnabled)
        $messages.scrollTop = $messages.scrollHeight;
}

$messages.addEventListener('scroll', (e) => {
    if ($messages.scrollTop >= ($messages.scrollHeight - $messages.offsetHeight))
        isAutoscrollEnabled = true;
    else
        isAutoscrollEnabled = false;
})

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', (message) => {
    console.log(message);
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });

    $sidebar.innerHTML = html;
})

$frmChat.addEventListener('submit', (e) => {
    e.preventDefault();

    let message = $txtMessage.value;
   
    if (message.trim().length > 0) {
        $btnSend.setAttribute('disabled', 'disabled');

        socket.emit('sendMessage', message, (error) => {
            $btnSend.removeAttribute('disabled');
            $txtMessage.value = '';
            $txtMessage.focus();
    
            if (error) {
                return console.log(error);
            }
        });
    }
    else {
        $txtMessage.value = '';
        $txtMessage.focus();
    }
});

$btnShareLocation.addEventListener('click', () => {
    if (!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.');
    }

    $btnShareLocation.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, () => {
            $btnShareLocation.removeAttribute('disabled');
            console.log('Location shared!');
        });
    });
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});