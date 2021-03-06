import React, { Component } from 'react';
import {
	BrowserRouter as Router,
	Route
} from 'react-router-dom';
import Home from './Home';
import Anouncements from './Anouncements';
import ActiveAnnouncement from './ActiveAnnouncement';
import ActionBar from './ActionBar';
import StatusBar from './StatusBar';
import NotFound from './NotFound';
import { spring, AnimatedSwitch } from 'react-router-transition';
import { AppProvider } from './AppContext';
import './App.css';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { 
	faCog, 
	faHome, 
	faBullhorn,
	faCrow,
	faFileAlt,
	faFutbol,
	faPaintBrush,
	faTheaterMasks,
	faMusic,
	faUsers,
	faChevronLeft,
	faChevronRight,
	faThumbtack,
	faTrash,
	faBan,
	faThumbsUp,
	faThumbsDown,
	faCalendar,
	faBell,
	faChevronDown,
	faPlusSquare,
	faBars,
	faMonument
} from '@fortawesome/free-solid-svg-icons'
import Login from './Login';

library.add(faBullhorn, faTrash, faBan, faHome, faCog, faCalendar);
library.add(faCrow, faFileAlt, faFutbol, faPaintBrush, faMusic, faUsers);
library.add(faTheaterMasks, faChevronLeft, faChevronRight, faThumbtack, faThumbsUp, faThumbsDown);
library.add(fab, faBell,faChevronDown, faPlusSquare, faBars, faMonument);


function mapStyles(styles) {
	return {
		opacity: styles.opacity,
		transform: `scale(${styles.scale})`,
	};
}
  
function bounce(val) {
	return spring(val, {
		stiffness: 400,
		damping: 25,
	});
}
  
const bounceTransition = {
	atEnter: {
		opacity: 0,
		scale: 1.1,
	},
	atLeave: {
		opacity: bounce(0),
		scale: bounce(0.9),
	},
	atActive: {
		opacity: bounce(1),
		scale: bounce(1),
	},
};

class App extends Component {
	render() {
		return (
			<Router>
				<AppProvider>
					<ActionBar/>
					<div className="app-container">
						<AnimatedSwitch
							atEnter={bounceTransition.atEnter}
							atLeave={bounceTransition.atLeave}
							atActive={bounceTransition.atActive}
							mapStyles={mapStyles}
							className="route-wrapper">
							<Route exact path="/" component={Home}/>
							<Route exact path="/announcements" component={Anouncements}/>
							<Route path="/announcements/:id" component={ActiveAnnouncement}/>
							<Route path="/login" component={Login}/>
							<Route path="/iostest" component={Home}/>
							<Route component={NotFound} />
						</AnimatedSwitch>
					</div>
					<StatusBar/>
				</AppProvider>
			</Router>
		);
	}
}

export default App;
