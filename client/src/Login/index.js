import React, { Component } from 'react';
import { AppContext } from '../AppContext';

export default class Login extends Component {
	componentWillMount() {
		let code = getParameterByName("code");
		fetch(`/api/user/login/callback/${code}`, {
			credentials: "same-origin",
			method:"GET"
		}).then((res) => {
			return res.json();
		}).then(() => {
			document.location.href="/";
		});
	}

	render() {
		let style = {
			height: "calc(100vh - 100px)",
			width: "100vw",
			backgroundColor: "rgb(220,220,220)",
			textAlign: "center",
			paddingTop: "100px"
		}
		return (
			<div style={style}>
				<AppContext.Consumer>
					{context => {
						this.showStatus = context.showStatus;
					}}
				</AppContext.Consumer>
				<div className="white-loader"></div>
				<h1>Logging In...</h1>
			</div>
		)
	}
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}