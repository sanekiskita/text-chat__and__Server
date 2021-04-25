import React from 'react';
import axios from 'axios';
import socket from '../socket';
import './InfoPanel.css';

//{userName,myRooms,uppdateRoom,roomId}
class InfoPanel extends React.Component{
 
    constructor(props){
        super(props);
        this.state = {
            addNewRoom: '',
          };
    }
/**
 * функция создает новую комнату
 *
 * @return {void} void
 */
    newRoom= async()=>{
        const {roomId,userName}=this.props;
        socket.emit('ROOM:USERDISCONNECT',{roomId,userName});
        const {data:newroomId} = await axios.post('http://localhost:5001/user',{userName});
        this.props.uppdateRoom(newroomId,userName);
    }
    /**
 * функция обновляет данные для новой комнаты
 *
 * @param {string} id комнаты 
 * @return {void} void
 */
    joinRoom = async(id)=>{
        const {roomId,userName}=this.props;
        const NewRoom=!id?this.state.addNewRoom:id;
        if(NewRoom!==roomId){
        socket.emit('ROOM:USERDISCONNECT',{roomId,userName});
        const {data:newroomId} = await axios.post('http://localhost:5001/joinroom',{userName,roomId:NewRoom});
        this.props.uppdateRoom(newroomId,userName);
        }
        this.setState({addNewRoom:''});
    }
 
render(){
    return(
        <div className="Container__RightContent">
            <div className="User__Info">
            <p> Здравствуйте {this.props.userName}</p>
            </div>
            <div className="Rooms">
            {this.props.myRooms.map((element,index)=>{
                return(
                    <div onClick={(e)=>{this.joinRoom(e.currentTarget.children[1].children[0].textContent)}} key={index} className="Rooms__item">
                        <p>{element.name}</p>
                        <p>id:<span>{element.id}</span></p>
                    </div>
                )
            })}
            </div>
            <div className="Rooms__padding">
            <div className="Rooms__Join">
                <div className="Rooms__Input">
                    <p>id room:</p>
                    <input value={this.state.addNewRoom} onChange={(e)=>{this.setState({addNewRoom:e.target.value})}}></input>
                </div>
                <button onClick={()=>{this.joinRoom()}}>Присоединиться</button>
            </div>
            <div className="Rooms__Create">
            <button onClick={this.newRoom}>создать новую комнату</button>
            </div>
            </div>
        </div>
        );
 }
}

export default InfoPanel