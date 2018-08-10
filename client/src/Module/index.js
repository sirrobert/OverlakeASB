import React, { Component } from 'react';
import './module.css';

export default class Module extends Component {
	constructor(props) {
		super();
		this.state = {
			...props,
			screenWidth: window.innerWidth,
		}

		this.windowListener = this.windowListener.bind(this);
		window.addEventListener("resize", this.windowListener)
	}

	windowListener() {
		this.setState({
				screenWidth: window.innerWidth,
			});
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.windowListener);
	}


	getSize() {
		let width = window.innerWidth;
		return {
			width: width > 1224 ? this.props.width : "100%",
			height: this.props.height,
		}
	}

	getID() {
		let title = this.props.title;
		title = title.toLowerCase();
		let parts = title.split(' ');
		let id = "";
		for (let i in parts) {
			id += parts[i] + "-";
		}
		id = id.substring(0, id.length - 1);
		return id;
	}

	render() {
		return (
			<div id={this.getID()} style={this.getSize()} className="module-container">
				<div className="module-header">
					<h1 className="module-title">{this.props.title}</h1>
				</div>
				<div className="module-body">
					{this.props.children}
				</div>
			</div>
		)
	}
}