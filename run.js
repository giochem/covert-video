const os = require('os');

function getCPUCount() {
    return os.cpus().length;
}
console.log(getCPUCount());