'use strict';

//in case we fetch from the API later
var apiKey = "d37398a8fa01ed9f121f9074b614e320";
var baseURL = "https://api.themoviedb.org/3";
var baseImageURL = "https://image.tmdb.org/t/p/w342";


//a function that "runs" our script
function main(){

  //fetch data (from local URL)
  //need to run as an external web server
  fetch('data/movies-2006-2015.json')
    .then(function(response){ return response.json(); })
    // .then(function(dataArray){
    //   dataArray.forEach(function(movie){ //view the data
    //     console.log(movie);
    //   });
    // })
    //.then(horrorSales);
    .then(genreSales)
    .then(showGenreStats);
}
main(); //call main function to start things

//Calculate the average sales for "Horror" films
function horrorSales(moviesArray) {

  //filter to only worry about the horror movies
  var horrorArray = moviesArray.filter(function(movieObj){
    return movieObj.genre === 'Horror';    
  })
  //console.log(horrorArray);

  //total tickets (basic loop)
  var totalSales = 0;
  horrorArray.forEach(function(movieObj){ //
    totalSales += movieObj.sales;
  });
  console.log("Avg Horror Gross ($):", totalSales/horrorArray.length);

  //Sales and Tickets (reduce)
  var grossesObj = horrorArray.reduce(function(totalsObj, currentMovieObj){
    totalsObj.sales += currentMovieObj.sales;
    totalsObj.tickets += currentMovieObj.tickets;
    return totalsObj;
  }, {sales:0, tickets:0});
  grossesObj.avgSales = grossesObj.sales/horrorArray.length;
  grossesObj.avgTickets = grossesObj.tickets/horrorArray.length;

  return grossesObj; //make available for next item
}

//calculate the average sales for films by genre
function genreSales(moviesArray) {

  //we don't know the genres, so can't just filter. But can still reduce!

  //the structure we'll produce:
  /*
  {
    horror : { 
      sales: #, 
      tickets: #, 
      count: #
    },
    action : {
      ...
    }
  }
  */
  var dataObj = moviesArray.reduce(function(totalsObj, currentMovieObj){
    //check if we have an entry for this genre
    var genre = currentMovieObj.genre;
    if(!totalsObj[genre]){ //if this is a new genre
      totalsObj[genre] = {sales:0, tickets:0, count:0, ratings:[]}; //create empty object
    }
    //now we must have an entry, so add to the counts
    totalsObj[genre].sales += currentMovieObj.sales;
    totalsObj[genre].tickets += currentMovieObj.tickets;
    totalsObj[genre].count += 1;

    totalsObj[genre].ratings.push(currentMovieObj.rating); //save the rating to a list

    return totalsObj; //make available for next item
  }, {});

  var genreArray = Object.keys(dataObj); //list of genres

  //generate some averages!
  genreArray.forEach(function(genreStr){
    //give element new property
    var genreStatObj = dataObj[genreStr]; //create reference for readability
    genreStatObj.avgTickets = genreStatObj.tickets / genreStatObj.count; //add field
    genreStatObj.avgSales = genreStatObj.sales / genreStatObj.count; //add field
  });

  //find some frequencies!
  genreArray.forEach(function(genreStr){
    var genreStatObj = dataObj[genreStr]; //create reference for readability
    genreStatObj.ratingFrequencies = calculateFrequencies(genreStatObj.ratings);    
  });

  //console.log(dataObj);

  return dataObj;
}

function showGenreStats(genreDataObj){

  var genreArray = Object.keys(genreDataObj); //list of genres

  //sort genres by avg tickets
  genreArray.sort(function(genreA, genreB){
    //if A is smaller, this number will be positive, and vice versa 
    return genreDataObj[genreB].avgTickets - genreDataObj[genreA].avgTickets;
  });

  var tbody = document.querySelector('tbody'); //element we'll attach to
  genreArray.forEach(function(genreStr){ //create a row for each genre
    var row = document.createElement('tr');
    row.innerHTML = '<td>'+genreStr+'</td>' +
                    '<td>'+numeral(genreDataObj[genreStr].avgTickets).format('0,0')+'</td>' +
                    '<td>'+numeral(genreDataObj[genreStr].avgSales).format('$0,0')+'</td>' +
                    '<td>'+ratingFrequencyString(genreDataObj[genreStr].ratingFrequencies)+'</td>';
                    
    tbody.appendChild(row);
  });
}

//Calculate frequency of data
//This is a "generic" method!
function calculateFrequencies(itemArray){
  var frequenciesObj = {}

  itemArray.forEach(function(itemStr){ //go through every item
    if(!frequenciesObj[itemStr]){ //if new, create an entry
      frequenciesObj[itemStr] = 0; //count starts at 0
    }
    frequenciesObj[itemStr]++; //increase count for this item
  });
  frequenciesObj.count = itemArray.length;

  return frequenciesObj;
}

//generate a String to show the ratings (in order!), for a particular genre
function ratingFrequencyString(frequenciesObj){
  //ratings, in order (finite list)
  var RATINGS = ['G','PG','PG-13','R','NC-17','Not Rated'];

  //reduce to a String
  var ratingStr = RATINGS.reduce(function(totalStr, rating){
    var percent = frequenciesObj[rating] / frequenciesObj.count;
    return totalStr + rating + ' ('+numeral(percent).format('0%') +'); ';
  }, '');

  return ratingStr;
}
