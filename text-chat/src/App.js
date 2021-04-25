import React from 'react';
import Chat from './Chat/Chat';
import Auth from './Auth/Auth';
import reducer from'./reducer.js';
import socket from './socket';
import InfoPanel from './InfoPanel/InfoPanel';
import './App.css';
import axios from 'axios';


function App() {
  const [state,dispatch] = React.useReducer(reducer,{
    isAuth:false,
    userName:null,
    roomId:null,
    usersInRomm:[],
    roomSetting:[],
    message:[],
    myRooms:[]
  });

  /**
 * функция проходит авторизацию и получает данные с сервера
 *
 * @param {obj} userInfo {userName,roomId} получаем пользователя и комнату
 * @return {void} void
 */
  const onLogin = async (userInfo)=> {
    dispatch({
      type:'IS_AUTH',
      payload:true,
      userName:userInfo.userName
    });
    uppdateRoom(userInfo.roomId,userInfo.userName);
  }
  /**
 * функция обновляет данные о комнатах
 *
 * @param {string} roomId id комнаты
 * @param {string} userName имя пользователя
 * @return {void} void
 */
  const uppdateRoom=async(roomId,userName)=>{
    socket.emit('ROOM:JOIN',{roomId,userName});
    let {data} = await axios.post(`http://localhost:5001/getusers/${roomId}`);
    setRoomInfo(data);
    allRooms(userName);
    setRoomId(roomId);
  }
  /**
 * функция обновляет данные о комнатах
 *
 * @param {obj} data {users[],message[]} массивы с информацией о пользователях и сообщениях
 * @return {void} void
 */
  const setRoomInfo= (data)=>{
    dispatch({
      type:'SET_USERS',
      usersInRomm:data.users,
      message:data.message,
      roomSetting:data.setting,
    });
  }
  /**
 * функция устанавливает id комнаты 
 *
 * @param {string} id id комнаты
 * @return {void} void
 */
  const setRoomId=(id)=>{
    dispatch({
      type:'SET_ROOMS_ID',
      roomId:id,
    });
  }

/**
 * функция получает все доступные комнаты пользователю 
 *
 * @param {string} name имя пользователя 
 * @return {void} void
 */
  const allRooms= async(name)=>{
    let {data} = await axios.post(`http://localhost:5001/allroom/${name}`);
    dispatch({
      type:'SET_MY_ROOMS',
      myRooms:data,
    });
  }

  React.useEffect(()=>{
    socket.on('ROOM:USERS',setRoomInfo);
    socket.on('ROOM:ADD_MESSAGE',(obj)=>{
      dispatch({
        type:'ADD_MESSAGES',
        message:obj,
      });
    });
  },[])


  return (
     <div className="Container">
        <Chat {...state}/>
        <InfoPanel {...state} uppdateRoom={uppdateRoom}  />
      {!state.isAuth && <Auth onLogin={onLogin}/>}
     </div>
  );
}

export default App;
