import React from 'react';
import axios from 'axios';

class Auth extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      ButtonText: "Вход",
      Lbutton: false,
    };
  }
      /**
 * функция проходит авторизацию
 *
 * @return {void} void
 */
  authorization = async () => {
    if (!this.state.userName)
      return alert("имя пустое");
    this.setState({ ButtonText: "ждите..." });
    let userName = this.state.userName
    try{
    const { data: roomId } = await axios.post('http://localhost:5001/user', { userName });
    this.props.onLogin({ userName, roomId });
    }catch(e){
      throw Error("Сервер не отвечате");
    }finally{
      this.setState({ ButtonText: "Вход" });
    }
    
  }

  render() {
    return (
      <div className="fon">
        <div className="Login">
          <p>Ваше имя</p>
          <br />
          <input className="Login__input" type="Login" value={this.state.userName} onChange={e => { this.setState({ userName: e.target.value }); this.setState({ Lbutton: !!e.target.value !== false ? true : false }); }}></input>
          <br />
          <button onClick={this.authorization} disabled={!this.state.Lbutton} className={`Login__button  ${this.state.Lbutton === true ? '' : '--grey'}`} >{this.state.ButtonText}</button>
        </div>
      </div>);
  }

}

export default Auth;