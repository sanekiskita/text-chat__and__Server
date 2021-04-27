import React from 'react';
import socket from '../socket';
import './Chat.css';

class Chat extends React.Component {
	//{usersInRomm,message,userName,roomId,roomSetting}
	constructor(props) {
		super(props);
		this.state = {
			valueMessage: '',
		};
	}
	/**
	 * функция отправляет сообщение
	 *
	 * @return {void} void
	 */
	onSendMessage = () => {
		if (!!this.state.valueMessage) {
			socket.emit('ROOM:NEW_MESSAGE', {
				text: this.state.valueMessage,
				roomId: this.props.roomId,
				userName: this.props.userName,
				date: new Date().toLocaleString(),
			});
			this.setState({ valueMessage: '' });
			this.props.message.push({ userName: this.props.userName, text: this.state.valueMessage, date: new Date().toLocaleString() });
		}
	};

	handleKeyPress = (event) => {
		if (event.key === 'Enter') {
			this.onSendMessage();
		}
	};

	render() {
		return (
			<div className="Container__LeftContent">
				<div className="Users">
					<div>
						<p>
							Название команты: {this.props.roomSetting.name} людей онлайн: {this.props.usersInRomm.length}
						</p>
						<ul>
							{this.props.usersInRomm.map((user, index) => (
								<li key={user + index}>{user},</li>
							))}
						</ul>
					</div>
					<div className="humburger">
						<div
							onClick={() => {
								this.props.setHumburger(!this.props.humburger);
							}}
							className={this.props.humburger ? 'open' : 'close'}
						></div>
					</div>
				</div>
				<div className="Container__Message">
					<div className="Baground">
						{this.props.message.map((message, index) => (
							<div key={index} className={`Message  ${message.userName !== this.props.userName ? '' : 'My'}`}>
								<div className="Message__Text">
									<p>{message.text}</p>
									<p className="Message__Auth">
										{message.date} автор: {message.userName}
									</p>
								</div>{' '}
							</div>
						))}
					</div>
				</div>
				<div className="Container__Input">
					<input
						className="Message__input"
						type="text"
						placeholder="Введите текст"
						value={this.state.valueMessage}
						onKeyPress={this.handleKeyPress}
						onChange={(e) => {
							this.setState({ valueMessage: e.target.value });
						}}
					></input>
					<button onClick={this.onSendMessage} className="Message__button"></button>
				</div>
			</div>
		);
	}
}

export default Chat;
