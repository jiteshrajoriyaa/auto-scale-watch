function getRandomValue(arr){
    let idx = Math.floor(Math.random()*arr.length)
    return arr[idx];
}


function processRequest(){
    let val = getRandomValue([100,150,200,300,400,500,1000]);
    let errors = ["Payment failed", "Too many requests", "Server down"]

    const throwError = getRandomValue([0,1,2,3,4,5]) === 5;
    if(throwError){
        throw new Error(getRandomValue(errors))
    }else{
        return new Promise((resolve)=> setTimeout(() => resolve(val), val))
    }
}

module.exports = processRequest