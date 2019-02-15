import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import { SIGUSR1 } from 'constants';
require('dotenv').config()
// graph[response.data.room_id][opposite] = this.state.roomId;
const secret_token = process.env.REACT_APP_TOKEN;
const logInChecker = require('../src/middleware/auth_checker.js');
const url = 'https://lambda-treasure-hunt.herokuapp.com/api/adv'
const next_room_checker = require('../src/middleware/next_room_checker');
axios.defaults.headers.common['Authorization'] = 'Token fe0987364d9af7c07a6c7a4bcc6927c83829ab5e'
// axios.defaults.headers.common['Authorization'] = `Token ${secret_token}`
axios.defaults.headers.post['Content-Type'] = 'application/json'

const inverse = {'n': 's', 's': 'n', 'w': 'e', 'e': 'w'};
const popSeed = { 
  '0': [
    {x: '60', y: '60'} , 
    {'w': '?', 'n': '10', 'e': '?', 's': '?'}
  ]
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      room_id: 0,
      cooldown: 10,
      coordinates: '',
      title: '',
      terrain: '',
      description: '',
      elevation: 0,
      errors: [],
      exits: [],
      items: [],
      messages: [],
      players: [],
      prevRoom: null, 
      prevDirection: null,
      seed: { 
        '0': [
          {x: '60', y: '60'} , 
          {'w': '?', 'n': '10', 'e': '?', 's': '?'}
        ]
      },
      inverse: {'n': 's', 's': 'n', 'w': 'e', 'e': 'w'},
    };
  }

  initialization = () => {
    axios.get(`${url}/init`)
      .then((res) => {
        console.log('Res', res.data)
        this.setState({ 
          room_id: res.data.room_id,
          cooldown: res.data.cooldown,
          coordinates: res.data.coordinates,
          title: res.data.title,
          terrain: res.data.terrain,
          description: res.data.description,
          elevation: res.data.elevation,
          errors: res.data.errors,
          exits: res.data.exits,
          items: res.data.items,
          messages: res.data.messages,
          players: res.data.players,
          
         })
      });
    }
  
  getCoord = () => {
    const coord = this.state.coordinates.split(',');
    console.log('Coord', coord);
    const x = coord[0].slice(1);
    const y = coord[1].slice(0, -1);
    console.log({x, y})
    return {x, y};
  }

  updateExits = () => {
    let exitObj = {};
    let exits = this.state.exits;
    console.log('Exits', exits);
    if (!this.seed[this.state.room_id]) {
      for (let d of exits) {
        console.log(d, exits[d]);
        this.seed[this.state.room_id][d] = '?';
      }
    } else {
      exitObj = this.seed[this.state.room_id];
    }
    console.log('EXITOBJ', exitObj)
    return exitObj;
  }



  updateSeed = () => {
    const rm = this.state.room_id;
    const coord = this.getCoord()
    const exits = this.updateExits()
    console.log({[rm]: [coord, exits]})
    return this.seed[{ [rm]: [coord, exits]}]
  }


  autoMovement = () => {
    while (Object.keys(this.state.seed).length < 50) {
      let curr_rm = this.state.room_id;
      let prev_rm = curr_rm;
      let curr_exits = this.state.exits;
      let any_exits = false;
      let move = '';
      console.log('RM & EXITS', curr_rm, curr_exits, any_exits)
      // for (let key in)

      // for (let key in this.state.seed[curr_rm][1]) {
      //   console.log('KEY', key)
      //   if (this.state.seed[curr_rm][1][key] === '?') {
      //     return any_exits = true;
      //   }
      // }
      if (any_exits === false) {
        console.log('**********')
        console.log(this.state.seed)
        console.log(this.state.seed[curr_rm][1])
        if (this.state.seed[curr_rm][1].length > 1) {
          console.log('**********', this.state.seed[curr_rm][1])
          // WILL EVENTUALLY DO BFS TO NEXT Q. let path_back = bfs(curr_rm, '?')
          // Immediate solution is to go to another random room
          move = this.state.exits[Math.floor(Math.random() * this.state.exits.length)]
        } else {
          console.log(this.state.exits[0])
          move = this.state.exits[0]
        }
      }
      console.log(this.state.exits)
      move = this.state.exits[Math.floor(Math.random() * this.state.exits.length)] 
    }
    console.log(this.state.seed)
    return this.state.seed
  }


  movement = (direction, next_room_id) => {     // Click
    const inverseDirection = inverse[direction]
    axios
      .post(`${url}/move/`, { direction: direction })
      .then((res) => {
        this.setState(prevState => ({ 
          prevRoom: prevState.room_id,
          prevDirection: direction,
          room_id: res.data.room_id,
          cooldown: res.data.cooldown,
          coordinates: res.data.coordinates,
          title: res.data.title,
          terrain: res.data.terrain,
          description: res.data.description,
          elevation: res.data.elevation,
          errors: res.data.errors,
          exits: res.data.exits,
          items: res.data.items,
          messages: res.data.messages,
          players: res.data.players,
          // seed: res.data.seed,
        }))
        console.log('Line 160', this.state.prevRoom, direction, inverseDirection, this.state.room_id)
        this.state.seed[this.state.prevRoom][1][inverseDirection] = this.state.room_id
        this.state.seed[this.state.room_id][1][direction] = this.state.prevRoom
        this.state.seed[this.state.room_id][0] = this.getCoord(this.state.coordinates)
        this.setState()
        console.log('Line 169', this.state.prevRoom, direction, inverseDirection, this.state.room_id)
      })
      .catch((err) => {
        console.error(err)
      })
    }

  // hydrateStateWithLocalStorage = () => {
  //   if (localStorage.hasOwnProperty('seed')) {
  //     let value = JSON.parse(localStorage.getItem('seed')) 
  //     console.log('Value', value) // popSeed at init call in componentsDidMount
  //     this.setState({ seed: value})
  //   // } else {
  //   //   localStorage.setItem('seed', JSON.stringify(popSeed))
  //   //   let value = JSON.parse(localStorage.getItem('seed'))
  //   //   console.log('Value2', value)
  //   //   this.setState({ seed: value})
  //   }
  // }

  handleDirMove = move => {
    setTimeout(() => {
      this.movement(move)
    }, 6000)
    
  }



    // compWillUnmount populatedseed
  componentDidMount = () => {
    // this.hydrateStateWithLocalStorage();
    const strSeed = localStorage.getItem('seed')
    this.initialization();
  }
  getSnapshotBeforeUpdate(prevProps, prevState) {
    return prevState.seed
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('Snapshot', snapshot)
    if (prevState.seed !== this.state.seed) {
        // save seed value to storage
        localStorage.setItem('seed', this.state.seed);
    }
    console.log(this.state.seed)
}



  
  render() {
    console.log('Render this.state', this.state)  //rm49
    return (
      <div className="App">
        <header className="App-header">
          <h1>Marauder's Map</h1>
          <h6>I solemnly swear that I am up to no good.</h6>
          <div className="map">
            <div>
<p>🏰⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿⬛⬛🏿⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏰</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿8️⃣7️⃣🏿⬛⬛⬛⬛⬛⬛⬛⬛9️⃣⬛⬛⬛⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿🏿🏿🏿🏿🏿⬜🏿⬛⬛⬛⬛⬛⬛🏿🏿⬜🏿⬛⬛⬛⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿1️⃣6️⃣1️⃣⬜7️⃣4️⃣🏿⬛⬛⬛⬛⬛⬛🏿1️⃣0️⃣⬛⬛⬛⬛⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿⬜🏿🏿🏿🏿🏿🏿🏿🏿🏿⬜🏿⬛⬛⬛⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿1️⃣8️⃣️8️⃣️⬜⬜1️⃣3️⃣9️⃣⬜6️⃣5️⃣⬜⬜5️⃣8️⃣️🏿🏿💰⬜⬜0️⃣⬜⬛🧙🏼‍⬛⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿⬜🏿🏿🏿🏿🏿⬜🏿🏿🏿🏿🏿⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿3️⃣6️⃣5️⃣🏿🏿3️⃣0️⃣4️⃣🏿🏿1️⃣6️⃣2️⃣⬜6️⃣7️⃣⬜⬜1️⃣6⃣⬜⬜8️⃣️🏿🏿2️⃣⬜⬜3️⃣⬜⬛⬛⬛       </p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿🏿⬜🏿🏿🏿⬜🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿⬜🏿🏿⬜🏿🏿⬜🏿🏿⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿3️⃣0️⃣5️⃣🏿3️⃣0️⃣1️⃣🏿1️⃣7️⃣1️⃣⬜⬜6️⃣1️⃣⬜⬜5️⃣6️⃣⬜⬜7️⃣⬜⬜6️⃣🏿🏿9️⃣⬜⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿🏿🏿⬜🏿🏿🏿⬜🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿⬜🏿🏿⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿2️⃣2️⃣2️⃣🏿2️⃣9️⃣2️⃣⬜1️⃣4️⃣8️⃣️⬜1️⃣3️⃣6️⃣⬜4️⃣9️⃣⬜2️⃣9️⃣⬜2️⃣1️⃣⬜⬜1️⃣2️⃣⬜⬛⬛</p>
<p>⬛⬛⬛⬛🏿🏿🏿🏿🏿🏿🏿🏿🏿⬜🏿🏿🏿⬜🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿⬜🏿🏿⬜🏿🏿🏿🏿🏿🏿⬜🏿⬛⬛</p>
<p>⬛⬛⬛⬛🏿4️⃣1️⃣9️⃣⬜2️⃣7️⃣6️⃣⬜1️⃣9️⃣7️⃣⬜1️⃣9️⃣6️⃣⬜1️⃣5️⃣9️⃣⬜1️⃣4️⃣2️⃣⬜1️⃣0️⃣2️⃣🏿7️⃣9️⃣🏿4️⃣5️⃣🏿2️⃣5️⃣⬜1️⃣8️⃣️🏿⬛⬛</p>
<p>
  
  🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿⬜🏿🏿🏿🏿🏿⬜🏿🏿🏿🏿🏿⬜🏿⬛⬛</p>
<p>🏿4️⃣9️⃣7️⃣⬜4️⃣3️⃣7️⃣⬜4️⃣2️⃣0️⃣⬜2️⃣1️⃣3️⃣⬜⬜1️⃣7️⃣9️⃣⬜1️⃣7️⃣5️⃣⬜1️⃣0️⃣9️⃣⬜9️⃣8️⃣⬜7️⃣0️⃣⬜6️⃣0️⃣⬜3️⃣6️⃣⬜⬜⛩️🏿⬛⬛</p>
<p>
  🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿⬜🏿🏿🏿🏿🏿🏿🏿🏿⬜🏿🏿🏿⬜🏿🏿🏿⬜🏿🏿⬜🏿🏿🏿🏿🏿⬜🏿🏿⬜🏿⬛⬛</p>


<p>🏿4️⃣9️⃣3️⃣⬜4️⃣9️⃣0️⃣⬜4️⃣4️⃣4️⃣🏿2️⃣3️⃣8️⃣️⬜2️⃣3️⃣3️⃣🏿🏿1️⃣8️⃣3️⃣🏿⬛⬛⬛⬛⬛⬛⬛1️⃣9️⃣6️⃣⬛⬛⬛⬛⬛🏿7️⃣8️⃣🏿⬛⬛</p>
<p>🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿⬜🏿🏿⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿🏿⬜🏿⬛⬛</p>
<p>⬛⬛⬛⬛⬛🏿4️⃣7️⃣8️⃣⬜3️⃣5️⃣1️⃣⬜3️⃣4️⃣3️⃣🏿2️⃣3️⃣6️⃣⬜2️⃣2️⃣9️⃣🏿⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿1️⃣0️⃣8️⃣️⬜⬛</p>
<p>⬛⬛⬛⬛⬛🏿🏿🏿🏿🏿🏿⬜🏿🏿🏿⬜🏿🏿🏿⬜🏿🏿🏿⬜🏿🏿⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿🏿⬜⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿4⃣9️⃣1️⃣🏿2️⃣7️⃣3️⃣⬜2️⃣6️⃣4️⃣🏿2️⃣5️⃣0️⃣⬜⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿⬜🏿🏿🏿⬜🏿🏿⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿3️⃣0️⃣8️⃣️⬜2️⃣7️⃣4️⃣🏿2️⃣9️⃣4️⃣🏿⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿🏿🏿🏿🏿🏿🏿🏿🏿🏿⬜🏿🏿⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬜3️⃣3️⃣4️⃣⬜⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿🏿⬜🏿🏿⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿3️⃣9️⃣3️⃣🏿⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿🏿⬜🏿🏿⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛</p>
<p>⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿4⃣8️⃣2️⃣🏿⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛</p>
<p>🏰⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏿🏿🏿🏿🏿⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🏰</p>

            </div>

          </div>
          <div className="bottom-row">
            <div className='description'>
              <p className='big'>Room {this.state.room_id} {this.state.coordinates}: {this.state.title}</p>
              <p className='big'>Exits: {this.state.exits}</p>
              <p>Next move in {this.state.cooldown} second(s).</p>
              <p className='terr'>Terrain & Elevation: {this.state.terrain}  {this.state.elevation}</p>
              <p>{this.state.description}</p>
              <p>On the ground you see: {this.state.items}</p>
              <p>TraversalPath: {this.state.traversalPath}</p>
              <p>Errors & Messages: {this.state.errors} {this.state.messages}</p>
            </div>
            <div className="direction-compass">
              <button className='btnNS' type="submit" onClick={() => this.handleDirMove('n')}>North</button>
              <div className='WestToEast'>
              <button className='btnEW' type="submit" onClick={() => this.handleDirMove('w')}>West</button>
              <button type="submit" onClick={() => this.autoMovement()}>
                <i className="far fa-compass" type="btn">
                  </i></button>
              <button className='btnEW' type="submit" onClick={() => this.handleDirMove('e')}>East</button>
              </div>
              <button className='btnNS' type="submit" onClick={() => this.handleDirMove('s')}>South</button>
            </div>
          </div>


        </header>
      </div>
    );
  }
}

export default App;

  // hydrateStateWithLocalStorage = e => {
  //   for (let room in this.state.seed) { // key is text
  //     console.log('Key', 'Value', room, this.state.seed[room])
  //     if (localStorage.hasOwnProperty(this.state.seed[room])) {
  //       let value = localStorage.getItem(this.state.seed[room]);
  //       console.log('Getting Value', value)
  //       try {
  //         value = JSON.parse(value);
  //         this.setState({ [this.state.seed]: value });
  //       } catch (e) {
  //         this.setState({ [this.state.seed]: value });
  //       }
  //     } else {
  //       let value = this.state.seed[room]
  //       console.log('Setting Value', value)
  //       localStorage.setItem(value, JSON.stringify(value))
  //     }
  //   }
  // }

  // console.log('Line 160', this.state.prevRoom, direction, inverseDirection, this.state.room_id)
  // this.state.seed[this.state.prevRoom][1][inverseDirection] = this.state.room_id
  // this.state.seed[this.state.room_id][1][direction] = this.state.prevRoom
  // this.state.seed[this.state.room_id][0] = this.getCoord(this.state.coordinates)
  // this.setState()
  // console.log('Line 169', this.state.prevRoom, direction, inverseDirection, this.state.room_id)




  // ## Movement & Wise Explorer
  // "Content-Type: application/json" -d '{"direction":"s", "next_room_id": "0"}
  // movement = (direction) => {
  //   console.log('Dir & Next Room', direction)
  //   const options = {
  //     headers: {
  //       Authorization: `Token fe0987364d9af7c07a6c7a4bcc6927c83829ab5e`
  //       // Authorization: `Token ${secret_token}`
  //     },
  //   };
  //   axios.post(`${url}/move`, direction, options)
  //     .then((res) => {
  //       console.log('RESSSSSS', res.data)

  //     })
  //   } 


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



    // FROM PYTHON SPRINT
    // if any_exits == False:           # If no ?, call BFS to determine next closest ?
    //     if len(seed[curr_rm]) > 1:   # If there are several exits, call bfs
    //         path_back = bfs(player.currentRoom.id, '?')
    //         if len(path_back) == 1:
    //             move = path_back[0]  # Sets move to direction return by BFS
    //     else:
    //         move = direction = inverse[facing] # If it is a deadend turn around

    // for direction in next_move[facing]:  # Chooses the direction to move in based on
    //     if direction in curr_exits:      # which direction the player is facing
    //         if curr_exits[direction] == '?': # and if the direction has a ?
    //             move = direction
    //             break
    // # while len(movezz):
    // #     for m in movezz:
    // #         player.travel(m)
    // #         traversalPath.append(m)
    // #         curr_rm = player.currentRoom.id
    // #         room_path.append(curr_rm)
    // #         seed[prev_rm][m] = curr_rm       # Adds move to curr_rm to seed of prev_rm
    // #         reverse_move = inverse[m]        # Used to add opposite move
    // #         exit_dict = {}                      # Used to create or maintain seed for curr_rm
    // #         next_exits = player.currentRoom.getExits() # Used to create seed for curr_rm
    // #         if curr_rm in seed:
    // #             exit_dict = seed[curr_rm]       # If seed exists for this room. Keep as is
    // #         else:
    // #             exit_dict[reverse_move] = prev_rm  # Creates seed for the 1st time a room is visited
    // #             for direction in next_exits:
    // #                 if direction == reverse_move:
    // #                     exit_dict[reverse_move] = prev_rm
    // #                 else:
    // #                     exit_dict[direction] = '?'
    // #         seed[curr_rm] = exit_dict
    // player.travel(move)                 # Player moves in direction determined above
    // traversalPath.append(move)          # Adds move to the traversal path
    // curr_rm = player.currentRoom.id     # Updates curr_rm (prev_rm was set at the top)
    // room_path.append(curr_rm)           # Adds new room to room_path
    // # if direction == 'e':                # prints moves
    // #     print(prev_rm, '---►', curr_rm)
    // # if direction == 'w':
    // #     print(curr_rm, '◄---', prev_rm)
    // # if direction == 'n':
    // #     print('    ', curr_rm)
    // #     print('      ▲')
    // #     print('      |')
    // #     print('    ', prev_rm)
    // # if direction == 'w':
    // #     print('    ', prev_rm)
    // #     print('      |')
    // #     print('      ▼')
    // #     print('    ', curr_rm)


    // seed[prev_rm][move] = curr_rm       # Adds move to curr_rm to seed of prev_rm
    // reverse_move = inverse[move]        # Used to add opposite move
    // exit_dict = {}                      # Used to create or maintain seed for curr_rm
    // next_exits = player.currentRoom.getExits() # Used to create seed for curr_rm
    // if curr_rm in seed:
    //     exit_dict = seed[curr_rm]       # If seed exists for this room. Keep as is
    // else:
    //     exit_dict[reverse_move] = prev_rm  # Creates seed for the 1st time a room is visited
    //     for direction in next_exits:
    //         if direction == reverse_move:
    //             exit_dict[reverse_move] = prev_rm
    //         else:
    //             exit_dict[direction] = '?'
    // seed[curr_rm] = exit_dict

    //   bfs = (curr_rm, target) => {
    // let visitedBFS = []
    // let queue = []
    // queue.push([curr_rm])
    // let visited = {}
    // // let c = 0
    // let navigate_back = {}
    // while(queue) {
    //   let path = queue.shift()
    //   let room = path[-1][0]
    //   if (visitedBFS.indexOf(room) < 0) {
    //     visited[room] = path
    //     if (room === target) {
    //       for (let key in seed) {
    //         if (key in path.slice(1, -1)){
    //           let get_dir = seed[]
    //         }
    //       }
    //     }

    //   }
//     }
// }
  // def bfs(curr_rm, target): 
  //   visited_bfs = []
  //   queue = deque()
  //   queue.append([curr_rm])
  //   visited = {}
  //   c = 0
  //   navigate_back = []
  //   # print(queue)
  //   while queue: 
  //       c += 1   
  //       path = queue.popleft()   
  //       room = path[-1:][0]
  //       if room not in visited_bfs:
  //           visited[room] = path   
  //           if room == target:         
  //               # print(path)                 # path from current room to first ?
  //               for key in seed:
  //                   if key in path[1:-1]:   # removes current room and ? from path
  //                       get_dir = seed[player.currentRoom.id] 
  //                       for dirs in get_dir:
  //                           if key == get_dir[dirs]:
  //                               # print(dirs, key)
  //                               navigate_back.append(dirs)
  //               # print('n', navigate_back)
  //               return navigate_back # Direction
  //           visited_bfs.append(room) 

  //           for next_exit in seed[room]:
  //               room_reversal_path = list(path)
  //               room_reversal_path.append(seed[room][next_exit])
  //               queue.append(room_reversal_path)