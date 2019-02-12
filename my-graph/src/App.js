import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
require('dotenv').config()

const secret_token = process.env.REACT_APP_TOKEN;
const logInChecker = require('../src/middleware/auth_checker.js');
const url = 'https://lambda-treasure-hunt.herokuapp.com/api/adv'
const next_room_checker = require('../src/middleware/next_room_checker');

// const traversalPath = []
// const room_path = [0]

// const seed = { 0: {'w': '?', 'n': '?', 'e': '?', 's': '?'} }
const inverse = {'n': 's', 's': 'n', 'w': 'e', 'e': 'w'};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      traversalPath: [],
      roomPath: [0],
      seed: { '0': {'w': '?', 'n': '?', 'e': '?', 's': '?'} },
      "room_id": 0,
      "title": "Room 0",
      "description": "You are standing in an empty room.",
      "coordinates": "(60,60)",
      "players": [],
      "items": ["small treasure"],
      "exits": ["n", "s", "e", "w"],
      "cooldown": 60.0,
      "errors": [],
      "messages": [],
      "elevation": 0,
      "terrain": "NORMAL"
    };
  }

  initialization = () => {
    const options = {
      headers: {
        Authorization: `Token fe0987364d9af7c07a6c7a4bcc6927c83829ab5e`
        // Authorization: `Token ${secret_token}`
      },
    };
    axios.get(`${url}/init`, options)
      .then((res) => {
        console.log('Res', res.data)
        this.setState({ 
          traversalPath: res.data.traversalPath,
          room_id: res.data.room_id, // 0
          title: res.data.title, // string
          description: res.data.description, // string
          coordinates: res.data.coordinates, // (60,60) 
          players: res.data.players, // []
          items: res.data.items, // []
          exits: res.data.exits, // ['n', 's', 'e', 'w']
          cooldown: res.data.cooldown, // 1
          errors: res.data.errors, // []
          messages: res.data.messages, // []
          elevation: res.data.elevation, // 0
          terrain: res.data.terrain,  // 'Normal'
        });
      })
    } 

  // componentDidMount() {
  //   console.log('THIS', this.state)
  //   this.initialization();
  // }

  // ## Movement & Wise Explorer
  // "Content-Type: application/json" -d '{"direction":"s", "next_room_id": "0"}
  movement = (direction, next_room_id) => {
    const options = {
      headers: {
        Authorization: `Token fe0987364d9af7c07a6c7a4bcc6927c83829ab5e`
        // Authorization: `Token ${secret_token}`
      },
    };
    axios.post(`${url}/move`, next_room_checker)
      .then((res) => {
        console.log('RESssss', res.data)
        // this.setState({ 
        //   this.state.traversalPath.push('n')
        //   room_id: res.data.room_id, // 0
        //   title: res.data.title, // string
        //   description: res.data.description, // string
        //   coordinates: res.data.coordinates, // (60,60) 
        //   players: res.data.players, // []
        //   items: res.data.items, // []
        //   exits: res.data.exits, // ['n', 's', 'e', 'w']
        //   cooldown: res.data.cooldown, // 1
        //   errors: res.data.errors, // []
        //   messages: res.data.messages, // []
        //   elevation: res.data.elevation, // 0
        //   terrain: res.data.terrain,  // 'Normal'
        // });
      })
    } 

  // componentDidMount() {
  //   console.log('THIS', this.state)
  //   this.movement();
  // }



  hydrateStateWithLocalStorage = e => {
    for (let key in this.state) { // key is text
      console.log('Key', key)
      console.log('Value', this.state[key])
      let value = this.state[key];
      if (localStorage.hasOwnProperty(key)) {
        value = localStorage.getItem(key);
        console.log('Value', value)
        try {
          value = JSON.parse(value);
          this.setState({ [key]: value });
        } catch (e) {
          this.setState({ [key]: value });
        }
      } else {
        localStorage.setItem(value, JSON.stringify(value))
      }
    }
  }



  handleInputChange = event => {
    console.log('Event', event)
    // this.setState({ [event.target.name]: event.target.value });
    // const { name, value } = event.target;
    // console.log('Name & Value', name, value)
    // this.setState( { traversalPath: { ...this.state.traversalPath, [name]: value}})
  };

  componentDidMount() {
    this.initialization();
    this.hydrateStateWithLocalStorage();
    this.movement();
    this.handleInputChange();
  }

  render() {
    console.log('Render this.state', this.state)

    return (
      <div className="App">
        <header className="App-header">
          <h1>Marauder's Map</h1>
          <p>I solemnly swear that I am up to no good.</p>
          <button className='btnNS' type="submit" onClick={() => this.state.traversalPath.push('n')}>North</button>
          <div className='WestToEast'>
          <button className='btnEW' type="submit" onClick={() => this.state.traversalPath.push('w')}>West</button>
          <i className="far fa-compass"></i>
          <button className='btnEW' type="submit" onClick={() => this.state.traversalPath.push('e')}>East</button>
          </div>
          <button className='btnNS' type="submit" onClick={() => this.state.traversalPath.push('s')}>South</button>
          <p>Current Room: {this.state.room_id} at {this.state.coordinates}. You see exits to the: {this.state.exits}</p>
          <p>Next move in {this.state.cooldown} second(s). Elevation is {this.state.elevation}. Terrain is {this.state.terrain}</p>
          <p>{this.state.title}: {this.state.description}</p>
          <p>On the ground you see: {this.state.items}</p>
          <p>TraversalPath: {this.state.traversalPath}</p>
          <p>Errors & Messages: {this.state.errors} {this.state.messages}</p>
          <p></p>


        </header>
      </div>
    );
  }
}

export default App;






//   render() {
//     console.log('THIS.STATE', this.state)
//     return (
//       <div className='App'>
//         <Navigation />  
//         {/* <UserList 
//         users={this.state.users}
//         />     */}
//         <Switch>
//             <div className='Nav-Bar2'>
//             <Route exact path='/' component={Home} />
//             <Route 
//               exact path='/register'
//               component={SignUp}
//                 />
//             <Route exact path='/login' component={SignIn} />
//             <Route 
//               exact path='/users' 
//               render={props => <Users {...props} users={this.state.users} /> } 
//             />
//             </div>
//           <Route component={WrongURL} />
//         </Switch> 
//       </div>
//     )
//   }
// } 



// export default withRouter(App);