import React, {useState, useEffect, useRef} from 'react';
import Map from 'react-map-gl';
import {Help, Cancel} from '@material-ui/icons'
import './App.css';
import axios from 'axios';
import CustomMarker from './components/CustomMarker';
import Register from './components/Register';
import Login from './components/Login';
import Guide from './components/Guide';
import CustomPopup from './components/CustomPopup';
import CustomNewPopup from './components/CustomNewPopup';
import UserPanel from './components/UserPanel';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed

function App() {
  const localStorage = window.localStorage;
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('user'));
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId'));
  const [color, setColor] = useState(localStorage.getItem('color'));
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [pins, setPins] = useState([]);
  const mapRef = useRef();
  const [viewState, setViewState] = useState({
    longitude: -150.4,
    latitude: 37.8,
    zoom: 8
  });
  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);
  const [rating, setRating] = useState(1);
  const [showRegister, setShowRegister] = useState(false);
  const [showFriend, setShowFriend] = useState(false);
  const [guideClick, setGuideClick] = useState(false);
  const [findUsername, setFindUsername] = useState(null);
  const [foundUser, setFoundUser] = useState(null);
  const [friends, setFriends] = useState([]);

  const getPins = async () => {
    try {
      const res = await axios.get('/pins/' + currentUserId);
      setPins(res.data);
    }
    catch (error) {
      console.log(error);
    }
  }

  const getFollowings = async () => {
    try {
      const res = await axios.get('/users/' + currentUserId + '/followings');
      console.log(res.data);
      const followings = [];
      res.data.map((data) => {
        followings.push(data.username);
      });
      setFriends(followings);
    }
    catch (error) {
      console.log(error);
    }
  }

  // get all pins from database everytime refreshing the page
  useEffect(() => {
    getPins();
    getFollowings();
  }, [currentUserId]);

  /* executed when clicking the marker */
  const markerClickHandler = (id, long, lat) => {
    setCurrentPlaceId(id);
    mapRef.current?.flyTo({center: [long, lat], duration: 1000});
  };

  /* executed when clicking the map */
  const mapClickHandler = () => {
    setCurrentPlaceId(null);
    setGuideClick(null);
    setShowFriend(false);
  };

  /* executed when clicking the map with right mouse */
  const mapRightClickHandler = (event) => {
    const longitude = event.lngLat.lng;
    const latitude = event.lngLat.lat;
    console.log(longitude + ' ' + latitude);
    setNewPlace({
      longitude: longitude,
      latitude: latitude
    });
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    const newPin = {
      username: currentUser,
      userId: currentUserId,
      title: title,
      description: description,
      rating: rating,
      lat: newPlace.latitude,
      long: newPlace.longitude
    }

    try {
      const res = await axios.post('/pins', newPin);
      setPins(prev => [...prev, res.data]);
      setNewPlace(null);
    }
    catch (error) {
      console.log(error);
    }
  };

  const searchFriendSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const findingUser = {
        username: findUsername
      };
      const res = await axios.post('/users/get', findingUser);
      if (res.data) {
        console.log(res.data);
        setFoundUser(res.data);
      }
      else {
        console.log('User does not exist!');
        setFoundUser(false);
      }
    }
    catch (error) {
      console.log(error);
      alert(error.response.data);
      setFoundUser(false);
    }
  };

  const logoutClickHandler = () => {
    setCurrentUser(null);
    setShowFriend(false);
    localStorage.removeItem('user');
  };

  const deleteClickHandler = async () => {
    if (!window.confirm('Do you want to delete this pin?')) {
      return;
    } 

    try {
      await axios.get('/pins/delete?id=' + currentPlaceId);
      getPins();
    }
    catch (error) {
      console.log(error);
    }
  };

  const guideClickHandler = () => {
    setGuideClick(prev => !prev);
  };

  const followClickHandler = async () => {
    try {
      const res = await axios.put('/users/' + foundUser._id + '/follow', { userId: currentUserId });
      console.log(res.data);
      getFollowings();
      setFoundUser(false);
    }
    catch (error) {
      console.log(error);
    }
  };

  const unfollowClickHandler = async () => {
    try {
      const res = await axios.put('/users/' + foundUser._id + '/unfollow', { userId: currentUserId });
      console.log(res.data);
      getFollowings();
      setFoundUser(false);
    }
    catch (error) {
      console.log(error);
    }
  };

  // friends grid
  const [rowData] = useState([
    { make: "Toyota", model: "Celica", price: 35000 },
    { make: "Ford", model: "Mondeo", price: 32000 },
    { make: "Porsche", model: "Boxster", price: 72000 }
  ]);

  const [columnDefs] = useState([
    { field: 'make' },
    { field: 'model' },
    { field: 'price' }
  ]);

  return (
    <div className='App'>
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.REACT_APP_MAPBOX}
        initialViewState={viewState}
        style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
        mapStyle="mapbox://styles/jaehyeonpaak/clk3lonwv000q01rd0jcu3lsf"
        onClick={mapClickHandler}
        onContextMenu={mapRightClickHandler}>
        {pins.map((pin) => (
          <div key={pin._id}>
            <CustomMarker 
              user={currentUser} 
              viewState={viewState}
              onClick={markerClickHandler}
              color={color}
              pin={pin}>
            </CustomMarker>
            {currentPlaceId === pin._id && (
              <CustomPopup
                pin={pin}
                setCurrentPlaceId={setCurrentPlaceId}
                deleteClickHandler={deleteClickHandler}>
              </CustomPopup>
            )}
          </div>
        ))}
        {newPlace && (
          <CustomNewPopup
            newPlace={newPlace}
            setNewPlace={setNewPlace}
            submitHandler={submitHandler}
            setTitle={setTitle}
            setDescription={setDescription}
            setRating={setRating}>
          </CustomNewPopup>
        )}
        <div className='guide-icon'>
          <Help onClick={guideClickHandler} style={{color: 'white'}}></Help>
        </div>
        {guideClick && (
          <Guide cancelClick={() => setGuideClick(null)}></Guide>
        )}
        {currentUser ? '' : (
          <Login 
            setShowRegister={setShowRegister}
            setCurrentUser={setCurrentUser}
            setCurrentUserId={setCurrentUserId}
            setColor={setColor}
            localStorage={localStorage}>
          </Login>
        )}
        <UserPanel
          currentUser={currentUser}
          currentUserId={currentUserId}
          logoutClick={logoutClickHandler}
          setShowFriend={setShowFriend}
          setColor={setColor}
          color={color}>
        </UserPanel>
        {showRegister && (
          <Register cancelClick={() => setShowRegister(false)}></Register>
        )};
        {showFriend && (
          <div className='friend-list-panel'>
            <Cancel className='friend-cancel' onClick={() => setShowFriend(false)}></Cancel>
            {foundUser && (
              <div className='friend-info'>
                <span>{foundUser.username}</span>                
                <button onClick={followClickHandler}>Follow</button>
                <button onClick={unfollowClickHandler}>Unfollow</button>
              </div>
            )}
            <form onSubmit={searchFriendSubmitHandler}>
              <input type='text' className='friend-form' minLength={4} placeholder='Type username' onChange={(event) => setFindUsername(event.target.value)}></input>
              <button className='submit-button' type='submit'>Search Friend</button>
            </form>    
            <span>Friends list</span>
            <div className='friend-list'>
              {friends.map((friend) => {
                return (
                  <div className='friend'>
                    <span className='friend-profile'></span>
                    <span className='friend-name' key={friend}>{friend}</span>
                    <span>Color</span>
                  </div>
                );
              })}
            </div>  
            <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}>
              </AgGridReact>
            </div>
          </div>
        )}
      </Map>
    </div>
  );
}

export default App;