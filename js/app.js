'use strict';

fetch('data/movies-2006-2015.json') // go get something
    .then(function (response) { // waiting for something to get back
        return response.json(); // when it get's back now you can start doing stuff
    })
    // .then(function(data){ // do stuff here
    //     console.log(data);
    // })
    .then(calculateGenreStats); // reducing redundancy

//How many people see horror movies
function countHorrorSales(moviesArray) {
    var horrorMoviesArray = moviesArray.filter(function (movieObj) {
        //return whether or not the movieObj is acceptable
        return (movieObj.genre === "Horror");
    });
    console.log(horrorMoviesArray);

    // goes through entire array and takes sales from each movie and adds it onto the total starting at 0
    var totalNum = horrorMoviesArray.reduce(function (prevTotal, movieObj) {
        var newTotal = prevTotal + movieObj.tickets;
        return newTotal;
    }, 0); // 0 is the first inital variable for totalNum 


    console.log("Total horror tickets:", totalNum);
    // return total number of sales
}

// what genre do people see the most?
function calculateGenreStats(moviesArray) {
 /* 
 {
     "horror" : {
         sales: number
         tickets: number
         count: number
     }
     "action" : {
     ...
     }
 }
 */

var dataobj = moviesArray.reduce(function(prevDataObj, movieObj){
    var genreStr = movieObj.genre; // e.g. "Horror"
    if (prevDataObj[genreStr] === undefined) { //if never seen before
        prevDataObj[genreStr] = {sales: 0, tickets: 0, count: 0 };
    }

    prevDataObj[genreStr].tickets += movieObj.tickets;
    prevDataObj[genreStr].sales += movieObj.sales;
    prevDataObj[genreStr].count += 1;

    return prevDataObj;
}, {})

console.log(dataobj);


}