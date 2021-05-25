const { execSync } = require('child_process')

const install = () => execSync(`cd ${process.cwd()} && npm install`).then(() => true);

module.exports = {
    install
}