const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')

const publicDirectoryPath = path.join(__dirname, "../public/");
const port = process.env.PORT || 3000

app.use(express.static(publicDirectoryPath));


//^ server (emit) -> client (receive) - message
//^ client (emit) -> server (receive) - sendMessage

io.on("connection", (socket)=>{
    console.log('new websocket')

    socket.on('join', ({username, room}, callback)=>{
        const {error, user} = addUser({id: socket.id, username, room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage("Admin","Welcome!")) 
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined`)) 
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })

        callback()

})

        //& socket.emit emits the changes to single connection
        //& socket.broadcast.emit emit to all user exept one user
        //& io.to.emit sends a message to all users in a room
        //& socket.broadcast.to.emit sends a message to all users in a room exept main usser
        //&  io.emit emits the changes to every connection

    socket.on('sendMessage', (message, callback)=>{
        const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity not allowed')
        }
        
        io.to(user.room).emit('message', generateMessage(user.username, message)) 
        callback()
    })

    socket.on('sendLocation', (coords, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('LocationMessage', generateLocationMessage(user.username ,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage("Admin", `${user.username} disconnected`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })

})


server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});