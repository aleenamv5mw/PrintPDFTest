const fs = require('fs')


async function updateToken(newToken){
        try {
            fs.writeFile("token.json", JSON.stringify({token: newToken}), err => {
                if (err) return console.log("Token not updated");
                console.log({Message : "Token updated"})
            })
        } catch (err) {
          console.error("Error in deleting files");
        }
}
exports.updateToken = updateToken;