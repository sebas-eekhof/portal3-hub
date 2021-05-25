const vm = require('vm');

const executeLibrary = ({library, func, args = {}}) => {
    const a = require(library);
    const command = _.get(a, func, false);
    if(!command)
        throw new Error(`Command ${func} in library ${library} not found.`);
    const out = command(...args);
    return out;
}

const executeJs = ({js}) => {
    const script = new vm.Script(js);
    const context = new vm.createContext(this);
    return script.runInContext(context)
}

module.exports = {
    executeLibrary,
    executeJs
}