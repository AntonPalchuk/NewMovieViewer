;(function () {
  let i = 1,
      itemAdvenceMode = false;
  const baseUrl = "http://www.omdbapi.com/?",
      apikey = "da3de619",
      loading = document.getElementsByClassName("loader")[0],
      divFilms = document.getElementsByClassName("divFilms")[0],
      tbody = document.getElementById("tbody"),
      filmList = document.getElementById("filmList"),
      input = document.getElementById("input"),
      mainDiv = document.getElementsByClassName("mainDiv")[0],
      buttonMore = document.getElementById("more"),
      a = document.getElementsByClassName("a")[0],
      advanceMode = document.getElementsByClassName("advanceMode")[0],
      typeFilm = document.getElementById("typeFilm"),
      yearFilm = document.getElementById("yearFilm");


      function locationIcon() {
        const column = document.getElementById("column");
        const table = document.getElementById("table");
        localStorage.getItem('locationIcon') === "table"?table.setAttribute("checked","true"):column.setAttribute("checked","true");
          column.addEventListener("click",function() {
            let location = column.checked?column.value:table.value;
            localStorage.setItem('locationIcon', location);
          })
          table.addEventListener("click",function functionName() {
            let location = column.checked?column.value:table.value;
            localStorage.setItem('locationIcon', location);
          })
      }

      function advance(){
        a.addEventListener("click",function() {
          if(itemAdvenceMode === false){
            advanceMode.classList.remove("advanceModeNone");
            itemAdvenceMode = true;
          }else{
            advanceMode.classList.add("advanceModeNone");
            itemAdvenceMode = false;
          }
        })
      }

    function sendRequest(parametrs){
      console.log(parametrs)
      let paramString = Object.keys(parametrs).map(function(key){
        return key + "=" + parametrs[key]
      }).join("&")
      console.log(baseUrl + "apikey=" + apikey + "&" + paramString);
      return fetch(baseUrl + "apikey=" + apikey + "&" + paramString);
    }

    const App = {
      movies: [],
      arrFavoriteFilmsName: [],
      currentMovie: null,
      currentPage: "home",
      handlers: function() {
        const button = document.getElementById("button"),
              self = this;
              button.addEventListener("click",function(){
                advanceMode.classList.add("advanceModeNone");
                if(input.value === ""){
                  button.setAttribute("data-toggle", "popover");
                  button.setAttribute("data-placement", "top");
                  button.setAttribute("data-content", "Please write the name of the movie");
                  return false;
                }
                mainDiv.classList.add("none");
                loading.classList.remove("none");
                sendRequest({
                  s: input.value,
                  page: 1,
                  type: typeFilm.value,
                  y: yearFilm.value
                })
              .then(function(response) {
                response.json().then(function(data) {
                  if(data.Error === "Movie not found!"){
                    document.getElementsByClassName("error")[0].classList.remove("none");
                    filmList.classList.add("none");
                    mainDiv.classList.remove("none");
                    loading.classList.add("none");
                    input.value = "";
                    function error() {
                      document.getElementsByClassName("error")[0].classList.add("none");
                    }
                    setTimeout(error,2000);
                    return false;
                  }else{
                    self.movies = data.Search;

                     self.draw(data.Search);
                     self.currentPage = "home";
                  }
                });
              })
              .catch(function(err) {
                console.log('error', err);
              });
        })
      },

      draw: function draw(movies){
        if(localStorage.getItem('locationIcon') === "table"){
          divFilms.classList.remove("divFilms");
          divFilms.classList.add("divFilmsTable")
        }else{
          divFilms.classList.add("divFilms");
          divFilms.classList.remove("divFilmsTable")
        }
        filmList.classList.remove("none");
        mainDiv.classList.add("none");
        loading.classList.add("none");
        divFilms.innerHTML = this.getMovieListTemplate(movies);
        const movieElements = document.querySelectorAll("div[data-id]");
        Array.from(movieElements).forEach(function(elem) {
          if(localStorage.getItem('locationIcon') === "table"){
            elem.classList.remove("nameAndYearFilms");
            elem.classList.add("nameAndYearFilmsTable");
          }else{
            elem.classList.add("nameAndYearFilms");
            elem.classList.remove("nameAndYearFilmsTable");
          }
          elem.addEventListener("click",function(elem) {
            loading.classList.remove("none");
            filmList.classList.add("none");
            App.showMeFilm(elem.currentTarget.getAttribute('data-id'));
            })

        })
        this.favoriteMovieMini();
      },
      showMeFilm: function (elem) {
        console.log(elem)
        const self = this;
          sendRequest({
            i: elem,
          })
          .then(function(response) {
            response.json().then(function(film) {
              self.currentMovie = film;
              self.drawFilm(film);
            });
          })
          .catch(function(err) {
            console.log('error', err);
          });
      },
      drawFilm: function(film){
        const self = this;
        const showFilm = document.getElementsByClassName("showFilm")[0];
          showFilm.classList.remove("none")
          loading.classList.add("none");
          showFilm.innerHTML = "";
          showFilm.innerHTML = this.getMovieTemplate(film);
          App.favoriteMovie();
          let backListFilm = document.getElementsByClassName("backListFilm")[0].addEventListener("click",function() {
            buttonMore.classList.remove("none");
            showFilm.innerHTML = "";
              if(this.currentPage === "favorite"){
                this.draw(self.getFavorite());
              }else{
                this.draw(self.movies);
              }
            // filmList.classList.remove("none");
          }.bind(this))
      },
      getMovieListTemplate: function (movieList) {
        const self = this;
        return movieList.map(function(movie) {
          const isFavorite = self.isMovieFavorite(movie.imdbID);
          return `
            <div class="${localStorage.getItem('locationIcon')==='table'?'nameAndYearFilmsTable':'nameAndYearFilms'}" data-id="${movie.imdbID}">

              <div class="posterMini">
              <img class = "favoriteIconMini" id="${movie.imdbID}" src="${isFavorite?'images/red.png':'images/3.png'}"/>
                <img src="${movie.Poster==="N/A"?'images/unnamed.jpg':movie.Poster}"/>
              </div>
              <div class="allSpansNameAndYear">
                <div class="span">${movie.Title}(${movie.Year})</div>
              </div>
            </div>
          `
        }).join("");
      },
      getMovieTemplate: function(movie) {
        const isFavorite = this.isMovieFavorite(movie.imdbID);
          return `
            <div class="containerFilm">
              <button type="submit" class="backListFilm black">Back</button>

              <div class="poster">
                <img src="${movie.Poster}"/>
              </div>
              <div class="contantFilm">
                <div>
                  <h2>${movie.Title}</h2>
                  <img class="favoriteIcon disabled" item-movie="${movie.imdbID}" src="${isFavorite?'images/red.png':'images/3.png'}"/>
                </div>
                <div>
                <span><b>Actors:</b> ${movie.Actors}</span><br>
                <span><b>Country:</b> ${movie.Country}</span><br>
                <span><b>Genre:</b> ${movie.Genre}</span><br>
                <span><b>Language:</b> ${movie.Language}</span><br>
                <span><b>Released:</b> ${movie.Released}</span><br>
                <span><b>Runtime:</b> ${movie.Runtime}</span><br>
                <span><b>Type:</b> ${movie.Type}</span><br>
                <span><b>Writer:</b> ${movie.Writer}</span><br>
                <span><b>Year:</b> ${movie.Year}</span><br>
                <span><b>imdbRating:</b> ${movie.imdbRating}</span><br>
                <div class="plot">
                  <div>Plot: ${movie.Plot}</div>
                </div>
                </div>
              </div>
            </div>
          `
      },
      moreFilms: function () {
        const self = this;
          buttonMore.addEventListener("click",function(){
            sendRequest({
              s: input.value,
              page: 1 + i,
              type: typeFilm.value,
              y: yearFilm.value
          })
          .then(function(response) {
            response.json().then(function(data) {
            self.movies = self.movies.concat(data.Search)
            console.log(self.movies);
            self.draw(self.movies);
            });
          })
          .catch(function(err) {
            console.log('error', err);
          });
          console.log(i);
          i++
        })
        buttonMore.classList.remove("noneImortant");
        buttonMore.classList.add("opacity");
      },

      favoriteMovie: function() {
        const self = this;
        document.getElementsByClassName("favoriteIcon")[0].addEventListener("click",function (e) {
          const id = e.currentTarget.getAttribute("item-movie");

          self.setFavorite(id);
          self.drawFilm(self.currentMovie);
        })
      },

      favoriteMovieMini:function () {
        const AllFavoriteMovieMini = document.getElementsByClassName("favoriteIconMini"),
              self = this;
          Array.from(AllFavoriteMovieMini).forEach(function(movie) {
            movie.addEventListener("click",function(e) {
              e.stopPropagation();
              const id = e.currentTarget.getAttribute("id");
              // e.currentTarget.setAttribute("src","red.png");
                self.setFavorite(id);
                if(self.currentPage === "favorite"){
                  self.draw(self.getFavorite());
                }else{
                  self.draw(self.movies);
                }
            })
          })
      },

      isMovieFavorite: function(id) {
        const arrMovie = this.getFavorite();
        return arrMovie.some(function(movie) {
          return movie.imdbID === id;
        })
      },

      getFavorite: function () {
        return JSON.parse(localStorage.getItem("favorites"))||[];
      },

      setFavorite: function (id,e) {
        let film = this.movies.filter(function(elem) {
          return elem.imdbID === id;
        })[0];
          const favorites = this.getFavorite();
          let checked = favorites.every(function(movie) {
              return movie.imdbID !== id;
          })
          if(checked){
            localStorage.setItem("favorites",JSON.stringify(favorites.concat(film)));
            // App.changesColorIconsFavoriteMovies();
          }else{
            let newArr = favorites.filter(function(movie) {
                return movie.imdbID !== id;
            })
            localStorage.setItem("favorites",JSON.stringify(newArr));
          }
      },

      header: function(arr) {
        const home = document.getElementsByClassName("home")[0];
        const favorite = document.getElementsByClassName("favorite")[0];
        const header = document.getElementsByClassName("header")[0];
        const showFilm = document.getElementsByClassName("showFilm")[0];
        const self = this;
        const options = document.getElementsByClassName("options")[0];
        favorite.addEventListener("click",function(){
          document.getElementsByClassName("option")[0].classList.add("none")
          divFilms.innerHTML = "";
          buttonMore.classList.add("none");
          showFilm.classList.add("none")
          const favoriteFilms = self.getFavorite();
          console.log(favoriteFilms);
          self.draw(favoriteFilms);
          self.currentPage = "favorite";
        })
        home.addEventListener("click",function(){
          document.getElementsByClassName("option")[0].classList.add("none");
          showFilm.classList.add("none");
          divFilms.innerHTML = "";
          buttonMore.classList.remove("none");
          const input = document.getElementById("input");
                input.value = "";
                mainDiv.classList.remove("none");
                filmList.classList.add("none");
        }.bind(this))
        options.addEventListener("click",function() {
          document.getElementsByClassName("option")[0].classList.remove("none");
          showFilm.classList.add("none");
          mainDiv.classList.add("none");
          filmList.classList.add("none");
        })
      }
    }
    locationIcon();
    advance();
    App.moreFilms();
    App.handlers();
    App.header();
    console.log(App)
}());
