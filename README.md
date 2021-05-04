# Moviesoftware Project 4.5.2021
School project that had a time limit of 4 weeks. 

#JSON properties External API and Database

There are two different types of properties for handling the JSON-data for the movies.
1. External API (omdbAPI) JSON properties:
    - Title - for the movies title
    - Year - for the movies year of release
    - imdbID - for the movies imdb sites ID
    - Runtime - for the movies length
    - Genre - for the genre of the movie
    - Director - for the directors
    - Actors - for the main actors
    - Plot - for the movies plot
    - Poster - for the movies poster/image

These are the properties that were used in this project when handling data from the external API, there are more properties for the external type of data.

2. Database JSON properties:
    - id - auto incremented number of the movie in database
    - name - for the movies title
    - year - for the movies year of relese
    - imageID - for the movies imdb sites ID
    - runtimeMin - for the movies length
    - genre - for the movies genre
    - director - for the directors
    - actors - for the actors
    - plot - for the movies plot
    - poster - for the movies poster/image

These are the properties that were used when dealing with database JSON-data.

#REST API CALLS
The script called "server.js" works as a REST API.

1. app.get('/home'), "/home"-call
    - Selects all movies from the database and uses JSON.stringify(MySQLData) to send the JSON-data.
    - use databases properties to access the JSON-data.


2. app.get('/search'), "/search"-call
    - Tries to find a movie from the external API with user inputs (title/year), year is optional.
    - To access the JSON-data, use the External API properties.
    - Uses attributes in the URL like "name" and "year".
      
To complete a search you could write -> "/search?name=movieName&year=movieYear"
or without the year.

    
3. app.post('/saveDataToDb'), "/saveDataToDb"-call
    - Tries to save a movie data to database, authors tool for adding movies more efficiently.
    - Here uses External API properties. Sends back a string response of success/failure.
    - Can't really use this just by typing it in the url.
    

4. app.post('/accountValidate'), "/accountValidate"-call
    - Tries to find the account credentials from the database with the users given username/password.
    - The JSON-data used here is a "user"-object with properties username and password.
    - Can't really use this just by typing it in the url.
    

5. app.post('/createAccount'), "/createAccount"-call
    - Tries to create an account and save it to database.
    - The JSON-data used here has username and password properties.
    - Can't really use this just by typing it in the url.
    
6. app.post('/saveMovieToDb'), "/saveMovieToDb"-call
    - Tries to save a movies data for a specific user.
    - Uses "name", "year", and "user" in the url
    - Can be called like: "/saveMovieToDb?name=movieName&year=movieYear&user=username"
    - Sends a string that contains message of success/failure as a response
    
7. app.get('/mymovies'), "/mymovies"-call
    - Finds the users movies from the database.
    - Can be called like: "/mymovies?user=username"
    - The response is a JSON-string that uses database properties if the request was a success.
    
