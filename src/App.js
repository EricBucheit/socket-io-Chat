import React from 'react';
import logo from './logo.svg';
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

selectRoom(room) {
  socket.emit("selectRoom", {room: room})
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
        
        <Card>
          <Card.Header style={{backgroundColor: "#5bc0de", borderRadius: 5}}>
           
          </Card.Header>

          <Card.Body style={{height: "100%"}}>
             <Container>
              <Row>
                <Col md={{ span: 4, offset: 0 }}>
                  <Card style={{ width: '18rem' }}>
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
                  </Card></Col>
              </Row>
            </Container>
            <br />
            <Card.Footer className="text-muted">
             <Container>

              <Row>

                <Col md={{ span: 12 }}>
                  <Card style={{ width: '100%'}}>
                    <Card.Header style={{backgroundColor: "#5bc0de"}}>
                        Messages
                         <span style={{float:"right"}}>
                          <h5 style={{fontFamily: 'Iowan Old Style'}}>Name:</h5>
                           <input style={{borderRadius: 5}} type="text" name="name" onChange={this.textChange} value={this.state.name}></input>
                        </span>
                    </Card.Header>
                    <ListGroup 
                      variant="flush" 
                      style={{height: '14rem', overflow:"scroll", border:"none"}}
                      onScroll={this.handleScroll}
                      ref={(div) => {
                        this.messageList = div;
                      }
                    }>
                     {this.messages()}
                    </ListGroup>
                    <Card.Footer className="text-muted">
                      <form onSubmit={this.sendMessage}>
                        <span style={{height: 50}}>
                        <input style={{width: "60%"}} type="text" name="outGoingMessage" onChange={this.textChange} value={this.state.outGoingMessage}></input>
                        <Button style={{marginBottom: 5, width: "30%", float:"right"}} type='submit' variant="info"> send </Button>
                        </span>
                      </form>
                    </Card.Footer>
                  </Card>
                </Col>
              </Row>
            </Container>

            </Card.Footer>

          </Card.Body>
        </Card>


      
      </div>
    );
  }
}

export default App;
