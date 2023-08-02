import React, {useState, useEffect, useRef} from 'react';
import Map from 'react-map-gl';
import {Help} from '@material-ui/icons'
import './App.css';
import axios from 'axios';
import CustomMarker from './components/CustomMarker';
import Register from './components/Register';
import Login from './components/Login';
import Guide from './components/Guide';
import CustomPopup from './components/CustomPopup';
import CustomNewPopup from './components/CustomNewPopup';
import UserPanel from './components/UserPanel';
import FriendPanel from './components/FriendPanel';

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
      setFriends(res.data);
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

  const unfollowClickHandler = async (userId) => {
    try {
      const res = await axios.put('/users/' + userId + '/unfollow', { userId: currentUserId });
      console.log(res.data);
      getFollowings();
      setFoundUser(false);
    }
    catch (error) {
      console.log(error);
    }
  };

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
          <FriendPanel
            setShowFriend={setShowFriend}
            foundUser={foundUser}
            followClickHandler={followClickHandler}
            unfollowClickHandler={unfollowClickHandler}
            searchFriendSubmitHandler={searchFriendSubmitHandler}
            setFindUsername={setFindUsername}
            friends={friends}>
          </FriendPanel>
        )}
      </Map>
    </div>
  );
}

export default App;