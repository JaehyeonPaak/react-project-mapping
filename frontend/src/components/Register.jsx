import React, {useState, useRef, useEffect, useReducer} from 'react';
import './Register.css';
import Footprint from '../assets/footprint.png';
import axios from 'axios';
import ReactDom from 'react-dom';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const initialState = {
  username: {
    value: '',
    isValid: false
  },
  email: {
    value: '',
    isValid: false
  },
  password: {
    value: '',
    isValid: false
  },
  confirmPassword: {
    value: '',
    isValid: false
  },
  isFormValid: false
};

const Register = (props) => {
  const reducer = (state, action) => {
    switch (action.type) {
      case 'FORM_VALID':
        let isFormValid = false;
        if (state.username.isValid && state.email.isValid && state.password.isValid && state.confirmPassword.isValid) {
          isFormValid = true;
        } 
        return {
          ...state,
          isFormValid: isFormValid
        }
      case 'USERNAME_CHECK':
        return {
          ...state,
          username: {
            value: action.username,
            isValid: action.username.trim().length > 3
          }
        }
      case 'EMAIL_CHECK':
        return {
          ...state,
          email: {
            value: action.email,
            isValid: action.email.includes('@')
          }
        }
      case 'PASSWORD_CHECK':
        return {
          ...state,
          password: {
            value: action.password,
            isValid: action.password.trim().length >= 6
          }
        }
      case 'CONFIRMPASSWORD_CHECK':
        return {
          ...state,
          confirmPassword: {
            value: action.confirmPassword,
            isValid: action.confirmPassword.trim().length >= 6 && state.password.value.trim().length >= 0
          }
        }
      default: 
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const submitHandler = async (event) => {
    event.preventDefault();
    const newUser = {
      username: state.username.value,
      email: state.email.value,
      password: state.password.value
    };

    try {
      const res = await axios.post('/users/register', newUser);
      setSuccess(true);
      setError(false);
    }
    catch (error) {
      console.log(error);
      console.log('Error message: ' + error.response.data);
      setSuccess(false);
      setError(true);
      setErrorMessage('Something went wrong! Contact to administrator');
    }
  };

  const cancelClickHandler = () => {
    props.cancelClick();
    setSuccess(false);
    setError(false);
  };

  useEffect(() => {
    if (success) {
      // 성공 이벤트 렌더링 및 로그인 페이지로 리다이렉트
    }
  }, [success]);

  useEffect(() => {
    dispatch({type: 'FORM_VALID'});
  }, [state.username.value, state.email.value, state.password.value, state.confirmPassword.value]);

  // Register 성공됐을 경우 Login 페이지로 Redirect

  // Username can only contain lowercase alphabets and numbers
  // Please enter the password first 
  // Write the correct email form including @
  // Username is duplicated 

  return (
    <React.Fragment>
      {ReactDom.createPortal(
        <div className='register-container'>
          <div className='register-title'>
            <img src={Footprint}></img>
            <span>Footprint</span>
          </div>
          <h1>Register</h1>
          <form className='register-form' onSubmit={submitHandler}>
            <div>
              <label for='username'>Username</label>
              <div className='input-container'>
                <SupervisedUserCircleIcon style={{ transform: 'scale(0.8)', marginLeft: '5px', color: 'rgb(126, 125, 125)' }}></SupervisedUserCircleIcon>
                <input id='username' type='text' placeholder='User name' onChange={(e) => dispatch({type: 'USERNAME_CHECK', username: e.target.value})}></input>
              </div>
            </div>
            <div>
              <label for='email'>Email</label>
              <div className='input-container'>
                <MailOutlineIcon style={{ transform: 'scale(0.8)', marginLeft: '5px', color: 'rgb(126, 125, 125)' }}></MailOutlineIcon>
                <input type='email' placeholder='Email' onChange={(e) => dispatch({type: 'EMAIL_CHECK', email: e.target.value})}></input>
              </div>
            </div>
            <div>
              <label for='password'>Password</label>
              <div className='input-container'>
                <LockOpenIcon style={{transform: 'scale(0.8)', marginLeft: '5px', color: 'rgb(126, 125, 125)'}}></LockOpenIcon>
                <input id='password' type='password' placeholder='Type your password' onChange={(e) => dispatch({type: 'PASSWORD_CHECK', password: e.target.value})}></input>
              </div>
            </div>
            <div>
              <label for='password-confirm'>Password Confirm</label>
              <div className='input-container'>
                <LockOpenIcon style={{transform: 'scale(0.8)', marginLeft: '5px', color: 'rgb(126, 125, 125)'}}></LockOpenIcon>
                <input id='password-confirm' type='password' placeholder='Confirm your password' onChange={(e) => dispatch({type: 'CONFIRMPASSWORD_CHECK', confirmPassword: e.target.value})}></input>
              </div>
            </div>
            <button className={state.isFormValid ? 'register-button' : 'register-disabled-button'} disabled={!state.isFormValid}>Register</button>
            <button className='register-cancel' onClick={cancelClickHandler}>Cancel</button>
            <div className='register-result'>
              {success && <span className='success'>Successfull. You can login now!</span>}
              {error && <span className='failure'>{errorMessage}</span>}
            </div>
          </form>
        </div>,
        document.getElementById('overlay-root')
      )}
    </React.Fragment>
  );
}

export default Register;