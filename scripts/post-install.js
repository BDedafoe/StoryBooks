const fs = require('fs-extra')

try {
    fs.copySync('.env')
    console.log('Environment file created successfully.')
} catch (err) {
    console.error(err)
}