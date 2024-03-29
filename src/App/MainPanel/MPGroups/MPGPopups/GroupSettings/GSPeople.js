import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import "./GSPeople.css"
import { groups_request_to_thread, groups_remove_person, groups_deny_request } from '../../../../../socket.js';
import { addThreadPeople, removeThreadPerson } from '../../../../../redux/groupsReducer.js';
import PersonPicker from '../../../../../GlobalComponents/PersonPicker.js';
import ProfilePicture from '../../../../../GlobalComponents/ProfilePicture.js';
import { getUser } from '../../../../../GlobalComponents/getUser.js';
import { alphabetizePeople } from '../../../../../GlobalComponents/peopleFunctions.js';

import { ReactComponent as Close } from '../../../../../assets/icons/close.svg';
import { ReactComponent as Done } from '../../../../../assets/icons/done.svg';
import { ReactComponent as AddPerson } from '../../../../../assets/icons/add_person.svg';

class GSPeople extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      personRemoving: "",
      personPickerOpen: false
    };

    this.personPickerRef = React.createRef();
    this.mousePressedDown = false;
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);

    this.addPerson = this.addPerson.bind(this);
    this.removePerson = this.removePerson.bind(this);
    this.removeRequested = this.removeRequested.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.handleClickOutside);
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleClickOutside);
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside(event) {
    if (this.personPickerRef && !this.personPickerRef.contains(event.target) && this.state.personPickerOpen) {
      if (event.type == "mousedown") {
        this.mousePressedDown = true;
      } else if (event.type == "mouseup") {
        if (this.mousePressedDown) {
          this.setState({
            personPickerOpen: false
          });
        }
      }
    }

    if (event.type == "mouseup") {
      this.mousePressedDown = false;
    }
  }

  setWrapperRef(node) {
    if (node != null) {
      this.personPickerRef = node;
    }
  }

  addPerson(email) {
    groups_request_to_thread(email, this.props.myThreadID);
  }

  removePerson(email) {
    groups_remove_person(this.props.myThreadID, email);
  }

  removeRequested(email) {
    groups_deny_request(this.props.myThreadID, email)
  }

  render() {
    let peopleElements = [];

    const myThread = this.props.threads[this.props.myThreadID];
    if (myThread == null) {
      return null
    }

    const newPeople = alphabetizePeople(myThread.people);
    const newRequested = alphabetizePeople(myThread.requested);

    const personRemoving = this.state.personRemoving;
    newPeople.forEach((item, i) => {
      const thisUser = getUser(item);

      peopleElements.push(
        <div className="gspPerson" key={item} style={personRemoving == item ? {background: "#1D954522"} : null}>
          <ProfilePicture
            email={item}
            picture={thisUser.picture}
            name={thisUser.name}
            className="gspPFP" />
          { thisUser.online ? <div className="gspOnline"></div> : null }
          <h1 className="gspName" style={personRemoving == item ? {width: "calc(100% - 85px)"} : null}>{thisUser.name}</h1>
          <Close className="gspRemove" onClick={() => {this.setState({personRemoving: item})}} style={personRemoving == item ? {visibility: "visible"} : null} />
          <div className={personRemoving == item ? "gspRemovingPerson" : "gspRemovingPerson gspRemovingPersonHide"}>
            <h1>Are you sure?</h1>
            <div><p>Do you want to remove <i style={{color: "#ddd"}}>{thisUser.name}</i> from this group?</p></div>
            <Done onClick={() => {this.setState({personRemoving: ""}); this.removePerson(item)}} />
            <Close onClick={() => {this.setState({personRemoving: ""})}} />
          </div>
        </div>
      );
    });

    newRequested.forEach((item, i) => {
      const thisUser = getUser(item);

      peopleElements.push(
        <div className="gspPerson" key={item} style={personRemoving == item ? {background: "#1D954522"} : null}>
          <img src={thisUser.picture} className="gspPFP" alt={thisUser.name} />
          <h1 className="gspName" style={{height: "20px", lineHeight: "20px", color: "#ddd", fontSize: "16px"}}>{thisUser.name}</h1>
          <p className="gspPending">Pending request...</p>
          <Close className="gspRemove" onClick={() => {this.setState({personRemoving: item})}} style={personRemoving == item ? {visibility: "visible"} : null} />
          <div className={personRemoving == item ? "gspRemovingPerson" : "gspRemovingPerson gspRemovingPersonHide"}>
            <h1>Are you sure?</h1>
            <div><p>Do you want to remove <i style={{color: "#ddd"}}>{thisUser.name}</i> from this group?</p></div>
            <Done onClick={() => {this.setState({personRemoving: ""}); this.removeRequested(item)}} />
            <Close onClick={() => {this.setState({personRemoving: ""})}} />
          </div>
        </div>
      );
    });


    return(
      <div className="GSPeople">
        <h1 className="gspTitle">People</h1>
        <div className="gspAddPersonDiv" onClick={() => {this.setState({personPickerOpen: true})}}>
          <AddPerson className="gspAddPersonIcon" />
          <h1 className="gspAddPersonText">Add person</h1>
        </div>
        <div className={this.state.personPickerOpen ? "gsapPicker" : "gsapPicker gsapPickerHide"} ref={this.setWrapperRef}>
          <PersonPicker callback={this.addPerson} noShow={newPeople.concat(newRequested)} />
        </div>
        <div className="gspPeopleList">
          { peopleElements }
          { peopleElements == null || peopleElements.length == 0 ?
            <div style={{position: "absolute", display: "flex", width: "100%", height: "calc(100% - 67px)", left: "0", top: "67px", alignItems: "center", justifyContent: "center"}}>
              <h1 style={{margin: "20%", color: "#fff5", fontSize: "16px", textAlign: "center"}}>
                No people
                { Object.keys(this.props.threads).length <= 0 ? null :
                  <Fragment>
                    <br/>
                    <span style={{color: "#fff3", fontSize: "14px"}}>Use the Add Person button to add your friends!</span>
                  </Fragment>
                }
              </h1>
            </div>
            : null
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  threads: state.groups.threads,
  knownPeople: state.people.knownPeople,
});

const mapDispatchToProps = {
  addThreadPeople,
  removeThreadPerson
}

export default connect(mapStateToProps, mapDispatchToProps)(GSPeople);
