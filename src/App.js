import React from 'react';
import socketIOClient from "socket.io-client";
import 'bootstrap/dist/css/bootstrap.min.css';
import {ListGroup, Container, Row, Col, Button} from 'react-bootstrap'
import Card from 'react-bootstrap/Card'

const ENDPOINT = "http://127.0.0.1:4001";
const socket = socketIOClient(ENDPOINT);

class ChatRoom extends React.Component {
    constructor() {
      super()
      this.state = {
        color: "none",
        room: false,
      }
    }

    componentDidMount() {
      this.setState({room: this.props.room});
    }

    onClick = () => {
        this.props.selectRoom(this.state.room)
    }

    render() {
      return(<ListGroup.Item onClick={this.onClick} style={{color: this.state.color}}>{this.props.room}</ListGroup.Item>)
    }
}


class App extends React.Component {

constructor() {
  super()
  this.state = {
    messages: [],
    outGoingMessage : '',
    rooms : [],
    name: "",
    roomName: "",
    currentRoom: "global",
    scrollToBottom: true,
    windowHeight: '14rem',
    windowVisible: "visible",
    windowFooterHeight: "100%",
    hidden: false,
    collapseButton: "X"
  }
}

componentDidMount = () => {
    socket.on("getMessages", data => {
      this.setState({messages: data})
    });

     socket.on("getChatRooms", data => {
      this.setState({rooms: data})
    });

    socket.on("createRoom", data => {
      console.log(data.message)
    });

    this.getMessages();
}

handleScroll = (e) => {
   const bottom = e.target.scrollHeight - Math.ceil(e.target.scrollTop) === e.target.clientHeight
    if (bottom) { 
      this.setState({scrollToBottom: true})
    } else {
      this.setState({scrollToBottom: false})
    }  
}

getMessages = () => {
  socket.emit("getMessages");
  socket.emit("getChatRooms");
  this.scrollToBottom()
  this.rAF = requestAnimationFrame(this.getMessages);

}

scrollToBottom() {
  if (!this.state.scrollToBottom) return
  const scrollHeight = this.messageList.scrollHeight;
  const height = this.messageList.clientHeight;
  const maxScrollTop = scrollHeight - height;
  this.messageList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
}

selectRoom = (room) => {
    this.setState({currentRoom : room})
  socket.emit("selectRoom", {room: room})
}
toggleWindow = () => {
    if (this.state.hidden === true) {
        this.setState({
                        windowHeight: "14rem", 
                        windowVisible: "visible", 
                        windowFooterHeight : "100%", 
                        hidden:false,
                        collapseButton: "X"
                    })
    } else {
         this.setState({
                        windowHeight: 0, 
                        windowVisible: "hidden", 
                        windowFooterHeight : 0, 
                        hidden:true,
                        collapseButton: ">"
                    })
    }
}

messages() {
  let messages = []
  for (let message in this.state.messages) {
      messages.push( <ListGroup.Item key={message}>{this.state.messages[message].name}: {this.state.messages[message].message}</ListGroup.Item>)
  }
  return (messages);
}

rooms() {
  let rooms = []
  for (let room in this.state.rooms) {
      rooms.push( <ChatRoom selectRoom={this.selectRoom} key={room} room = {this.state.rooms[room]} />)
  }
  return (rooms);
}

textChange = (e) => {
  this.setState({[e.target.name]: e.target.value})
}

sendMessage = (e) => {
  e.preventDefault();
  socket.emit("message", {name: this.state.name || "Anonymous", message: this.state.outGoingMessage})
  this.setState({outGoingMessage: ''});
}

createRoom = () => {
  socket.emit("createRoom", {roomName: this.state.roomName, isPrivate: false, password: false})
  this.setState({roomName: ''});
}

render() {
    return (
      <div className="App">
             
             <Container style={{position: "absolute", left: "0%", top:"0%", padding: 0}}
             onMouseDown = {this.mouseDown}
             onMouseUp = {this.mouseUp}

             >
                  <Card style={{ width: '10rem' }}>
                    <Card.Header style={{backgroundColor: "#5bc0de"}}>Rooms</Card.Header>
                    <ListGroup variant="flush" style={{height: '6rem', overflow:"scroll", border:"none"}}>
                     {this.rooms()}
                    </ListGroup>
                     <Card.Footer className="text-muted">
                      <input type="text" name="roomName" style={{width: "100%"}} onChange={this.textChange} value={this.state.roomName}></input>
                      <br />
                      <br />
                      <Button type='button' variant="primary" style={{width: "100%"}} onClick={this.createRoom}> Create </Button>
                    </Card.Footer>
                  </Card>
             
            </Container>


            
            <Container style={{position: "fixed", bottom:"0%"}}>
              <Row>
                <Col md={{ span: 4, offset: 0 }}>
                  <Card style={{ width: '18rem'}}>
                    <Card.Header style={{backgroundColor: "#5bc0de"}}>
                    {this.state.currentRoom}
                    <Button 
                            variant="primary"
                            type="button"
                            style={{position: "absolute", left: "85%", top: 5}}
                            onClick={this.toggleWindow}
                    >
                    {this.state.collapseButton}
                    </Button>
                    </Card.Header>
                     <ListGroup 
                      variant="flush" 
                      style={{height: this.state.windowHeight, overflow:"scroll", border:"none"}}
                      onScroll={this.handleScroll}
                      ref={(div) => {
                        this.messageList = div;
                      }
                    }>
                     {this.messages()}
                    </ListGroup>
                     <Card.Footer className="text-muted" style={{height: this.state.windowFooterHeight}}>
                      <form onSubmit={this.sendMessage}>
                        <span style={{height: 0}}>
                        <input autoComplete="off" style={{width: "100%", visibility: this.state.windowVisible}} type="text" name="outGoingMessage" onChange={this.textChange} value={this.state.outGoingMessage}></input>
                        <br />
                        <br />
                        <Button style={{marginBottom: 5, width: "100%", float:"right"}} type='submit' variant="info"> send </Button>
                        </span>
                      </form>
                    </Card.Footer>
                  </Card></Col>
              </Row>
            </Container>

      
      </div>
    );
  }
}

export default App;
