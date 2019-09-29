const socket = io();

// Elements
$frmJoin = document.getElementById('frmJoin');
$txtUsername = document.getElementById('txtUsername');
$txtRoom = document.getElementById('txtRoom');

$frmJoin.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = $txtUsername.value;
    const room = $txtRoom.value;

    socket.emit('validateUser', { username, room }, (error) => {
        if (error) {
            return alert(error);   
        }

        $frmJoin.submit();
    });
})