import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { ContextMenu, MenuItem } from "react-contextmenu";
import FeedEntity from './FeedEntity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AppContext } from '../../AppContext';
import './feed.css';

const SCROLL_UPDATE_OFFSET = 50;
const LOAD_LIMIT = 20;

export default class Feed extends Component {
	constructor(props) {
		super();
		this.state = {
			announcements: [],
			filters: props.filters,
			hasFetchedAnnouncements: false,
			isAdmin: false,
			pinAction: "Pin",
			fetchingNextAnnouncements: false,
			offset: 0,
			announcementCount: 0
		};
		this.renderAnnouncements = this.renderAnnouncements.bind(this);
		this.handlePinnedAnnouncement = this.handlePinnedAnnouncement.bind(this);
		this.handleDeleteAnnouncement = this.handleDeleteAnnouncement.bind(this);
		this.handleRejectedAnnouncement = this.handleRejectedAnnouncement.bind(this);
		this.getPinAction = this.getPinAction.bind(this);
		this.handleDeleteAnnouncement = this.handleDeleteAnnouncement.bind(this);
		this.handleFeedScroll = this.handleFeedScroll.bind(this);
		this.fetchAdmin = this.fetchAdmin.bind(this);
	}

	componentWillReceiveProps(props) {
		this.setState({
			offset: 0,
			filters: props.filters,
			announcements: [],
			fetchingNextAnnouncements: true,
		}, () => {
			this.fetchAnnouncementCount(() => {
				this.fetchAnnouncements();
			});
		});
		
	}

	fetchAdmin() {
		fetch(`/api/user/can/Admin`, {
			credentials: 'include'
		}).then((res) => {
			return res.json();
		}).then((json) => {
			if (json.success) {
				this.setState({
					isAdmin: json.can
				})
			}  else  {
				this.setState({
					isAdmin: false
				})
			}
		})
	}
	
	componentWillMount() {
		this.fetchAdmin();
		this.fetchPinned();
	}

	componentWillUnmount() {
		let element = document.getElementsByClassName('feed-container')[0];
		element.removeEventListener("scroll", this.handleFeedScroll);
	}

	fetchAnnouncementCount(next) {
		let query = this.getFilterQuery();
		fetch(`/api/announcements${query}`, {
			credentials: 'include'
		}).then((res) => {
			return res.json();
		}).then((json) => {
			this.setState({
				announcementCount: json.count
			});
			next()
		});
	}

	fetchPinned() {
		fetch('/api/announcements/pinned', {
			credentials: 'include'
		})
		.then(res => res.json())
		.then((announcements) => {
			this.setState({
				announcements: announcements,
			});
		});
	}

	fetchAnnouncements() {
		let query = this.getFilterQuery();
		fetch(`/api/announcements/load/${this.state.offset}${query}`, {
			credentials: 'include'
		})
		.then(res => res.json())
		.then((announcements) => {
			let stateAnnouncements = this.state.announcements;
			announcements.forEach((announcement) => {
				stateAnnouncements.push(announcement);
			});
			this.setState({
				announcements: stateAnnouncements,
				hasFetchedAnnouncements: true,
				fetchingNextAnnouncements: false,
				offset: this.state.offset + LOAD_LIMIT,
			});
			this.addFeedScrollListener();
		});
	}

	addFeedScrollListener() {
		let element = document.getElementsByClassName('feed-container')[0];
		if (element) {
			element.removeEventListener("scroll", this.handleFeedScroll);
			element.addEventListener("scroll", this.handleFeedScroll);
		}
	}

	handleFeedScroll(e) {
		let scrollTillBottom = e.target.scrollHeight - e.target.offsetHeight - e.target.scrollTop;
		if (scrollTillBottom < SCROLL_UPDATE_OFFSET && !this.state.fetchingNextAnnouncements && this.state.offset < this.state.announcementCount) {
			this.setState({
				fetchingNextAnnouncements: true,
			});
			this.fetchAnnouncements();
		}
	}

	renderAnnouncements() {
		return this.state.announcements.map((announcement) => {
			return <FeedEntity source={this.props.feedSource} key={announcement._id} type="announcement" entity={announcement}/>
		});
	}

	getFilterQuery() {
		if (this.state.filters) {
			let search = this.getSearchFilter();
			let grade = this.getGradeFilter();
			let type = this.getTypeFilter();
			let filters = [ search, grade, type ];
			filters = filters.filter(filter => filter != null);
			let filterString = JSON.stringify(filters);
			let escapedString = encodeURIComponent(filterString);
			return `?filters=${escapedString}`;
		} else {
			return '';
		}
	}

	getSearchFilter() {
		let search = this.state.filters.search;
		if (search === null || search === "") {
			return null;
		}
		return [
			{
				key: "Announcement",
				value: search,
				comparator: "$regex",
			},
			{
				key: "Title",
				value: search,
				comparator: "$regex",
			},
			{
				key: "Author",
				value: search,
				comparator: "$regex"
			}
		]
	}

	getGradeFilter() {
		let grade = this.state.filters.grade;
		if (grade === null || grade === "") {
			return null;
		}
		return {
			key: "Grades",
			value: grade.replace("Grade ", ""),
			comparator: "$in"
		}
	}

	getTypeFilter() {
		let type = this.state.filters.type;
		if (type === null || type === "") {
			return null;
		}
		return {
			key: "Type",
			value: type == null ? "" : type,
			comparator: "$eq"
		}
	}

	getPinAction(e) {
		if (e.detail.data.entity.pinned) {
			this.setState({
				pinAction: "Unpin"
			});
		} else {
			this.setState({
				pinAction: "Pin"
			});
		}
	}

	handlePinnedAnnouncement(e, data) {
		fetch(`/api/announcements/pinned/${data.entity._id}`, {
			method: "PUT",
			credentials: 'include'
		}).then((res) => {
			return res.json();
		}).then((json) => {
			if (json.success) {
				let announcements = this.state.announcements;
				let index = this.getAnnouncementById(json.announcement._id);
				let announcement = announcements[index];
				announcement.pinned = !announcement.pinned;
				console.log(announcements);
				announcements = this.handleAnnouncementReposition(announcement, index);
				console.log(announcements);
				this.setState({
					announcements: announcements
				});
				let pinAction = !json.announcement.pinned ? "Pinned" : "Unpinned"
				this.showStatus({
					message: `${pinAction} Announcement`,
					color: "#37784f",
					fontColor: "white",
					duration: 3
				});
			} else {
				this.showStatus({
					message: `Failed To Toggle Pin Of The Announcement`,
					color: "red",
					fontColor: "black",
					duration: 3
				});
			}
		})
	}

	getAnnouncementById(id) {
		let announcements = this.state.announcements;
		for (let i = 0; i < announcements.length; i++) {
			if (announcements[i]._id === id) {
				return i;
			}
		}
		return -1;
	}

	handleAnnouncementReposition(announcement, index) {
		let announcements = this.state.announcements;
		announcements.splice(index, 1);
		let repositionIndex = -1;
		if (!announcement.pinned) {
			repositionIndex = this.getUnpinnedIndex(announcement);
		} else {
			repositionIndex = 0;
		}
		announcements.splice(repositionIndex, 0, announcement);
		return announcements;
	}

	getUnpinnedIndex(announcement) {
		let announcements = this.state.announcements;
		for (let i = 0; i < announcements.length; i++) {
			if (announcement.dateCreated > announcements[i].dateCreated && !announcements[i].pinned) {
				return i;
			}
		}
		return announcements.length;
	}

	handleRejectedAnnouncement(e, data) {
		fetch(`/api/announcements/unapprove/${data.entity._id}`, {
			method: "PUT",
			credentials: 'include'
		}).then((res) => {
			return res.json();
		}).then((json) => {
			if (json.success) {
				let announcements = this.state.announcements;
				let index = this.getAnnouncementById(data.entity._id);
				announcements.splice(index, 1);
				this.setState({
					announcements: announcements
				});
				this.showStatus({
					message: "Unapproved Announcement",
					color: "gray",
					fontColor: "black",
					duration: 3
				});
			} else {
				this.showStatus({
					message: "Failed to unapprove Announcement",
					color: "red",
					fontColor: "black",
					duration: 3
				});
			}
		})
	}

	handleDeleteAnnouncement(e, data) {
		fetch(`/api/announcements/${data.entity._id}`, {
			method: "DELETE",
			credentials: 'include'
		}).then((res) => {
			return res.json();
		}).then((json) => {
			if (json.success) {
				let announcements = this.state.announcements;
				let index = this.getAnnouncementById(data.entity._id);
				announcements.splice(index, 1);
				this.setState({
					announcements: announcements
				});
				this.showStatus({
					message: "Deleted Announcement",
					color: "red",
					fontColor: "black",
					duration: 3
				})
			} else {
				this.showStatus({
					message: "Failed To Delete Announcement",
					color: "gray",
					fontColor: "black",
					duration: 3
				})
			}
		});
	}

	render() {
		if (!this.state.hasFetchedAnnouncements) {
			return (
				<div className="loader">Loading...</div>
			);
		} else {
			return (
				<div className="feed-scroll-container">
					<div className="feed-container">
						<AppContext.Consumer>
							{context => {
								this.showStatus = context.showStatus;
							}}
						</AppContext.Consumer>
						<ReactCSSTransitionGroup
							transitionName="feather"
							transitionEnterTimeout={250}
							transitionLeaveTimeout={250}>
							{this.renderAnnouncements()}
							{ this.state.fetchingNextAnnouncements ? 
								<div className="loader">Loading...</div> :
								null
							}
						</ReactCSSTransitionGroup>
						{!this.state.isAdmin ? null : 
							<ContextMenu onShow={this.getPinAction} collect={props => props} id={`contextmenu-${this.props.feedSource ? this.props.feedSource : "announcements"}`}>
								<MenuItem onClick={this.handlePinnedAnnouncement}>
									<FontAwesomeIcon className="entity-context-menu-icon" size="1x" icon="thumbtack"/>
									{this.state.pinAction} Announcement
								</MenuItem>
								<MenuItem  onClick={this.handleRejectedAnnouncement}>
									<FontAwesomeIcon className="entity-context-menu-icon" size="1x" icon="ban"/>
									Unapprove Announcement
								</MenuItem>
								<MenuItem  onClick={this.handleDeleteAnnouncement}>
									<FontAwesomeIcon className="entity-context-menu-icon" size="1x" icon="trash"/>
									Delete Announcement
								</MenuItem>
							</ContextMenu>
						}
					</div>
				</div>
			)
		}
	}
}