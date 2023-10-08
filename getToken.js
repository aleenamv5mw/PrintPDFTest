const axios = require("axios")
const fs = require('fs')

async function getToken () {
  var token;
  try{
      token = require('./token.json')
      if(JSON.stringify(token).length < 20) {
          token = false;
      }else{
          if(JSON.parse(Buffer.from(token.token.split('.')[1], 'base64').toString()).exp > Date.now()){
            console.log("Token reused")
              return [token.token, false];
          }else{
              token = false;
          }
      }
  }catch(e){
      token = false;
  }

  if(!token){
      console.log("creating new token")
      token = await Login();
      if(!token) return false;
       return [token, true];
  }
}



async function Login() {
  try {
    const options = {
        method: 'POST',
        url: 'https://idp.app-framework.meltwater.io/login',
        headers: {'Content-Type': 'application/json'},
        data: {email: process.env.EMAIL, password: process.env.PASSWORD, rememberMe: true}
    };

    let result = await axios.request(options)
    if(!result.data.success) return false;
    return result.data.token;
    } catch (e) {
      console.log("failed to generate token")
      return false;
    }
}
  exports.getToken = getToken;
