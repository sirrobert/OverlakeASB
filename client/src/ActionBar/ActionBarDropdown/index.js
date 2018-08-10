import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class ActionBarDropdown extends Component {
	constructor(props) {
		super()
		this.state = {
			visible: props.visible
		}
		this.toggle = this.toggle.bind(this);
		this.handleAnimation = this.handleAnimation.bind(this);
		this.closeOther = props.closeOther;
		this.parentToggle = props.toggle;
	}

	componentWillReceiveProps(props) {
		let prevVisible = this.state.visible;
		this.setState({
			visible: props.visible
		}, () => {
			if (prevVisible && !props.visible) {
				this.handleAnimation(prevVisible, 0);
			}
		});

	}

	toggle() {
		this.closeOther();
		this.handleAnimation(this.state.visible, 250);
		this.parentToggle();
	}

	handleAnimation(visible, timeout) {
		let elem = document.getElementById(this.props.name);
		let children = elem.getElementsByClassName("action-bar-menu-item");
		if (visible) {
			for (let i = 0; i < children.length; i++) {
				children[i].style.opacity = 0;
			}
			elem.style.maxHeight = 0;
			setTimeout(() => {
				elem.style.border = "none";
				elem.style.borderTop = "none";
				for (let i = 0; i < children.length; i++) {
					children[i].style.display = "none";
				}
			}, timeout);
		} else {
			elem.style.maxHeight = "200px";
			elem.style.border = "5px solid rgb(183, 169, 36)";
			elem.style.borderTop = "5px solid gold";
			for (let i = 0; i < children.length; i++) {
				children[i].style.display = "block";
			}
			setTimeout(() => {
				for (let i = 0; i < children.length; i++) {
					children[i].style.opacity = 1;
				}
			}, 100)
		}
	}

	renderItems() {
		return this.props.items.map((item, i) => {
			return <li key={i} className="action-bar-menu-item">{item}</li>
		})
	}

	render() {
		let badgeClass = !this.props.badge ? "" : "action-bar-badge";
		let badgeCount = !this.props.badgeCount ? 0 : this.props.badgeCount;
		console.log(badgeClass, badgeCount);
		return (
			<div className="action-bar-dropdown">
				<div onClick={this.toggle} data-badge-count={badgeCount} className={`action-bar-button ${badgeClass}`}>
					<FontAwesomeIcon 
						data-badge-count={badgeCount}
						
						size="2x" 
						icon={this.props.icon} />
				</div>
				<ul style={{width: this.props.menuWidth}} id={this.props.name} className="action-bar-menu">
					{this.renderItems()}
				</ul>
			</div>
		)
	}
}