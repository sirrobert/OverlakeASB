
import React, { Component } from 'react';
import {
	BrowserRouter as Router,
	Route,
	Switch
} from 'react-router-dom';
import Home from './Home';
import Anouncements from './Anouncements';
import Navbar from './Navbar';
import './App.css';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faCog } from '@fortawesome/free-solid-svg-icons'

library.add(faCog);
library.add(fab);
console.log(fab);

class App extends Component {
	render() {
		return (
			<Router>
				<div>
					<Navbar></Navbar>
					<Switch>
						<Route exact path="/" component={Home}/>
						<Route path="/anouncements" component={Anouncements}/>
					</Switch>
				</div>
			</Router>
		);
	}
}

export default App;