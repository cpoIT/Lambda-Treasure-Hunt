import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

const token = process.env.REACT_APP_API_URL;
const url = 'https://lambda-treasure-hunt.herokuapp.com/api/adv'

class App extends Component {
  constructor(props) {
    super();
    this.state = {

        "room_id": 0,
        // "title": "Room 0",
        // "description": "You are standing in an empty room.",
        // "coordinates": "(60,60)",
        // "players": [],
        // "items": ["small treasure"],
        // "exits": ["n", "s", "e", "w"],
        // "cooldown": 60.0,
        // "errors": [],
        // "messages": []
    };
  }

  authenticate = () => {
    // const token = localStorage.getItem('secret_bitcoin_token');
    const options = {
      headers: {
        Authorization: 'Token ' + token,
      },
    };

    if (token) {
      axios.get(`${url}/init`, options)
        .then((res) => {
          console.log('RES', res.data)
          if ((res.status === 200 || res.status === 201) && res.data) {
            this.setState({ loggedIn: true, users: res.data.users });
          }
          else {
            throw new Error();
          }
        })
        .catch((err) => {
          this.props.history.push('/'); //login
          
        });
    } else {
      this.props.history.push('/'); //login
    }
  }

  // componentDidMount(){
  //   this.authenticate();
  // }

  // componentDidUpdate(prevProps) {
  //   const { pathname } = this.props.location;
  //   // console.log('this.props', this.props);
  //   // console.log('prevProps', prevProps);
  //   if (pathname === '/' && pathname !== prevProps.location.pathname) {
  //     this.authenticate();
  //   }
  // }


  render() {
    console.log('THIS.STATE', this.state)

    return (
      <div className="App">
        <header className="App-header">
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
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