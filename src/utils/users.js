const users = [];

const validateUser = ({ username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find(user => user.room === room && user.username === username);

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is already in use!'
        }
    }
}

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const result = validateUser({ username, room });

    if (result)
        return result;

    // Store user
    const user = { id, username, room };
    users.push(user);

    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);
    let removedUser;

    if (index >= 0) {
        removedUser = users.splice(index, 1)[0];
    }

    return removedUser;
}

const getUser = (id) => {
    return users.find(user => user.id === id);
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room.toLowerCase());
}

module.exports = {
    validateUser,
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}