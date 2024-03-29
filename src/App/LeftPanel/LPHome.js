import React from 'react';
import { connect } from 'react-redux';

import './LPHome.css';
import withRouter from "../../GlobalComponents/withRouter.js";
import { setOpenedDM } from '../../redux/dmsReducer';
import { setOpenedThread } from '../../redux/groupsReducer';

class LPHome extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);

    this.state = {
      opened: false // This is used to start the Home icon animation when opening the Home page
    };
  }

  componentDidMount() {
    if (this.props.router.location.pathname == "/home") {
      this.setState({
        opened: true
      });
    }
  }

  componentDidUpdate() {
    if (this.props.router.location.pathname == "/home" && !this.state.opened) {
      this.setState({
        opened: true
      });
      this.props.setOpenedDM("");
      this.props.setOpenedThread(null);
    } else if (this.props.router.location.pathname != "/home" && this.state.opened) {
      this.setState({
        opened: false
      });
    }
  }

  handleClick(e) {
    e.preventDefault();

    this.props.router.navigate("/home");
    this.props.hideLeftPanel(); // Obviously, this method does nothing when the user is not in mobile.
  }

  render () {
    let opened = false;
    if (this.props.router.location.pathname == "/home") {
      opened = true;
    }

    return (
      <div className="LPHome" onClick={this.handleClick} style={{backgroundPositionX: opened ? "0" : ""}}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className={opened ? "homeIcon homeIconAnimate" : "homeIcon"}>
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        { this.props.dms_requests.length > 0 || Object.keys(this.props.groups_requests).length > 0 || Object.keys(this.props.announcements).includes("welcome") && !this.props.announcementsRead.includes("welcome") ?
          <div className="hwUnreadDot" style={{top: "32.5px", right: "20px"}}></div>
          : null
        }
        <h1 className="homeText">Home</h1>
        <div className="homeSelected" style={{transform: opened ? "none" : ""}} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  dms_requests: state.dms.requests,
  groups_requests: state.groups.requests,
  announcementsRead: state.app.announcementsRead,
  announcements: state.app.announcements,
});

const mapDispatchToProps = {
  setOpenedDM,
  setOpenedThread
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LPHome));
