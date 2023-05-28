const users = []

//~ addUser
const addUser = ({id, username, room})=>{
    //* clean the data
    username = username.trim()
    room = room.trim()
    //* Validate data
    if(!username || !room){
        return {
            error:'Username and room are required'
        }
    }
    //* check for exixting user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    //* Validate userName
    if(existingUser){
        return{
            error:'Username is in use!'
        }
    }
    //* store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

//~ removeUser
const removeUser = (id)=>{
    const index = users.findIndex((user)=> user.id === id)

    if(index !==-1){
        return users.splice(index, 1)[0]
    }

}

//~ getUser
const getUser = (id)=>{
    return users.find((user)=> user.id === id)
}

//~ getUserInRoom
const getUserInRoom = (room)=>{
    room = room.trim()
    return users.filter((user)=> user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}