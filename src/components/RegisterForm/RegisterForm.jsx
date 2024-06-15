import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [emailAddress, setemailAddress] = useState('');

  const errors = useSelector((store) => store.errors);
  // const dispatch = useDispatch();
  

  const registerUser = (event) => {
    event.preventDefault();

    // history.push('/registerpage/registerpage2');
   
    // dispatch({
    //   type: 'REGISTER',
    //   payload: {
    //     username: username,
    //     password: password,
    //     emailAddress: emailAddress,
    //   },
    // });

  }; // end registerUser

  return (
    <form className="formPanel" onSubmit={registerUser}>
      <h2>Register User</h2>
      {errors.registrationMessage && (
        <h3 className="alert" role="alert">
          {errors.registrationMessage}
        </h3>
      )}
      <div>
        <label htmlFor="username">
          Username:
          <input
            type="text"
            name="username"
            value={username}
            required
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label htmlFor="emailAddress">
          email:
          <input
            type="text"
            name="emailAddress"
            value={emailAddress}
            required
            onChange={(event) => setemailAddress(event.target.value)}
          />
        </label>
      </div>
      <div>
        <label htmlFor="password">
          Password:
          <input
            type="password"
            name="password"
            value={password}
            required
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
      </div>
      {/* <div>
        <input className="btn" type="submit" name="submit" value="Register" />
      </div> */} 
      {/* 👆 uncomment for the final component to log a user in. */}
    </form>
  );
}

export default RegisterForm;
