const { execSync } = require('child_process')

const install = () => execSync(`cd ${process.cwd()} && npm install`);

module.exports = {
    install
}