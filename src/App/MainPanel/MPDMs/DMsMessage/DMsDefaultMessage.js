import React from 'react';
import { connect } from 'react-redux';
import TextareaAutosize from 'react-autosize-textarea';
import Linkify from 'react-linkify';

import './DMsDefaultMessage.css';
import '../../MessageStyles/DefaultMessage.css';
import { ReactComponent as Edit } from '../../../../assets/icons/edit.svg';
import { getUser } from '../../../../GlobalComponents/getUser.js';
import { parseDate, ParseDateLive } from '../../../../GlobalComponents/parseDate.js';
import { dms_edit_message } from '../../../../socket.js';
import ProfilePicture from '../../../../GlobalComponents/ProfilePicture';

class DMsDefaultMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editingInputVal: ""
    };

    this.inputRef = React.createRef();

    this.inputEnterPressed = this.inputEnterPressed.bind(this);

    this.editingID = null;
    this.editingIDOriginal = "";
  }

  componentDidUpdate(prevProps) {
    if (this.props.onUpdate != null) {
      this.props.onUpdate();
    }

    if (prevProps.editing != this.editingID && this.editingID != null) {
      if (this.inputRef.current != null) {
        this.inputRef.current.focus()
      }
      this.setState({ editingInputVal: this.editingIDOriginal })
    }

    if (prevProps.openedDM != this.props.openedDM) {
      this.props.setMessageEditing(false);
    }
  }

  inputEnterPressed(event) {
    let code = event.keyCode || event.which;
    if (code === 13 && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();

      const iv = this.state.editingInputVal;
      if (iv != null && iv != "") {
        if (this.editingIDOriginal != iv) {
          const oc = this.props.openedDM;
          dms_edit_message(oc, this.props.editing, iv);
        }
        this.setState({editingInputVal: ''});
        this.props.setMessageEditing(false);
      }
    } else if (code == 27) {
      this.setState({editingInputVal: ''});
      this.props.setMessageEditing(false);
    }
  }

  render() {
    const thisUser = getUser(this.props.openedDM);
    const lastMessage = this.props.messages[this.props.messages.length - 1];

    return (
      <div className="DMsDefaultMessage">

        <ProfilePicture
          email={this.props.email}
          picture={this.props.picture}
          name={this.props.name}
          opendialog={this.props.email != this.props.myEmail ? this.props.opendialog : null}
          className="defaultMessagePFP" />
        <div className="defaultMessageName">
          {this.props.name}
          {this.props.messages.length > 0 && lastMessage.sending ? <h1 className="defaultMessageSendingText">Sending...</h1> : null}
        </div>
        <div className="defaultMessageGroup">
          { this.props.messages == null ? null :
            this.props.messages.map(item => {
              let lrClasses = "defaultLastRead defaultIndicatorHide"
              if (item.lastRead) {
                lrClasses = "defaultLastRead";
              }
              if (item.noTransition) {
                lrClasses += " noTransition";
              }

              let messageClass = "defaultMessageText";
              if (item.sending) {
                messageClass = "defaultMessageText defaultMessageSending";
              }

              if (this.props.editing === item.id) {
                this.editingID = item.id;
                this.editingIDOriginal = item.message;
                return <TextareaAutosize
                          key={"id" + item.id}
                          value={this.state.editingInputVal}
                          onChange={(event) => this.setState({ editingInputVal: event.target.value })}
                          onKeyDown={this.inputEnterPressed}
                          className="defaultMessageText defaultMessageEditInput"
                          maxLength={1000}
                          ref={this.inputRef} />;
              } else {
                if (this.props.editing - this.props.messages[0].id < 0 || lastMessage.id < this.props.editing) {
                  this.editingID = null;
                }

                const lastReadElement = <ProfilePicture
                                          email={this.props.openedDM}
                                          className={lrClasses} />;
                const editedElement = item.edited == false ? null : <span title={"Edited on " + parseDate(item.edited, "basic")} className="defaultMessageEditSpan">(edited)</span>;
                let editIconElement = null;
                if (this.props.email == this.props.myEmail && window.innerWidth > 880) {
                  editIconElement = <Edit className="defaultMessageEditIcon" onClick={() => this.props.setMessageEditing(item.id)} />;
                }
                return (
                  <div key={"id" + item.id} title={parseDate(item.timestamp, "basic")} className={messageClass}>
                    <Linkify componentDecorator={(decoratedHref: string, decoratedText: string, key: number) => (
                        <a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer">
                          {decoratedText}
                        </a>
                      )}>
                      <p>{item.message}{editedElement}</p>
                    </Linkify>
                    {lastReadElement}
                    {editIconElement}
                  </div>
                );
              }
            })
          }
        </div>

        <h1 className="defaultMessageTimestamp">
          {this.props.messages == null || this.props.messages.length == 0 || lastMessage.sending ? "" : <ParseDateLive timestamp={lastMessage.timestamp} format="long" />}
        </h1>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  myEmail: state.app.email,
});

export default connect(mapStateToProps, null)(DMsDefaultMessage);
