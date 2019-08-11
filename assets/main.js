//const tracksEl = document.querySelector('.tracks')

class TrackList {
  // Creating our Class
  constructor(domSelector, search) {
    // Getting a domelement
    this.container = document.querySelector(domSelector);
    // Store my data
    this.data = null;
    // Represents the currently displayed data
    this.viewData = null;

    // Show stuff
    this.render();
  }

  modViewData(newData) {
    this.viewData = newData;
    this.render();
  }

  template(music) {
    const html = music
      .map(function(myTrack, index) {
        const artName = myTrack.artistName;
        const trackName = myTrack.trackName;
        const artwork = myTrack.artworkUrl60;
        const price = myTrack.trackPrice;
        const curr = myTrack.currency;
        const trackId = myTrack.trackId;
        const albumOnly = price < 0 ? "Album only" : `${price} ${curr}`;
        return `
        <div class="row">
          <img src="${artwork}" class="cover">
          <p>${artName}</p>
          <p>${trackName}</p>
          <p>${albumOnly}</p>
          <p class="playbutton"><i id="${trackId}" class="far fa-play-circle"></i> 
          <i id="pausebutt" class="far fa-pause-circle"></i></p>
         </div>
        `;
      })
      .join("");
    return html;
  }

  updateData(data) {
    this.data = data;
    this.viewData = data;
    this.render();
  }
  defaultTemplate() {
    return `
    <div>Search to see music</div>
    `;
  }

  sortPricing(direction) {
    return this.data.sort(function(a, b) {
      return (a.trackPrice - b.trackPrice) * direction;
    });
  }

  sortByName(prop, direction) {
    return this.data.sort(function(a, b) {
      let nameA = a[prop].toUpperCase();
      let nameB = b[prop].toUpperCase();
      if (nameA < nameB) {
        return -1 * direction;
      }
      if (nameA > nameB) {
        return 1 * direction;
      }
      return 0;
    });
  }

  filterArtist(search) {
    const html = this.viewData.filter(track => {
      if (search == "" || typeof search == "undefined") {
        return track;
      } else if (
        track.artistName.toLowerCase().includes(search.toLowerCase())
      ) {
        return track;
      }
    });
    this.modViewData(html);
  }

  //playing and pause eventlisteners
  addEventListeners() {
    let playLinks = document.querySelectorAll(".fa-play-circle");
    let data = this.data;
    playLinks.forEach(function(link) {
      link.addEventListener("click", function(event) {
        console.log(`Playing ${event.target.id}`);
        // Retrieve the data for the selected track
        let myTrack = data.filter(track => track.trackId == event.target.id);
        // Create an audio player for the selected track
        document.querySelector("#play").innerHTML = `<audio id="player_${
          event.target.id
        }" src="${myTrack[0].previewUrl}"></audio>`;
        document.querySelector(`#player_${event.target.id}`).play();
      });
    });

    // Create event listeners for any pause button
    let pauseLinks = document.querySelectorAll(".fa-pause-circle");
    pauseLinks.forEach(link => {
      link.addEventListener("click", () => {
        //Select and stop the running audio player
        let sounds = document.querySelector("audio");
        sounds.pause();
        console.log("Stop music!");
      });
    });
  }

  searchGlobal(search) {
    const modSearch = search.replace(" ", "%20");
    const url = `https://dci-fbw12-search-itunes.now.sh/?term=${modSearch}`;
    // const req = new XMLHttpRequest();
    // req.open("GET", url, true);
    // req.responseType = "json";
    // req.onload = function() {
    //   var jsonResponse = req.response;
    //   console.log(jsonResponse.results);
    //   myTrackList.updateData(jsonResponse.results);
    //   // do something with jsonResponse
    // };

    // req.send(null);
    fetch(url)
      .then(response => {
        console.log(response);
        return response.json();
      })
      .then(data => {
        myTrackList.updateData(data.results);
      })
      .catch(function(err) {
        console.log("Something went wrong!", err);
      });
  }

  render() {
    // Out put will hold the complete view
    let output = "";

    // Setting up data for our view
    const header = "<h1>My Tracks</h1>";
    const heardRow = `
    <section class="headrow row">
    <div>Cover</div>
    <div>Name <p class=angles><i class="fas fa-sort namesort"></i>
    </p>
    </div>
    <div>Artist<p class=angles><i class="fas fa-sort artsort"></i>
    </p></div>
    <div>Price<p class=angles><i class="fas fa-sort pricesort"></i>
    </p></div>
    <div>Preview</div>
    </section>`;
    // template methode accepts data to view and returns html string
    const template = this.viewData
      ? this.template(this.viewData)
      : this.defaultTemplate();
    // Adding data in to our view !Order Matters!
    output += header;
    output += "<p>Data from iTunes</p>";
    output += heardRow;
    output += template;

    // Assinging view in to innerHTML of our domElement form the constructor
    this.container.innerHTML = output;
    this.addEventListeners();
  }
}

const myTrackList = new TrackList(".tracks");
myTrackList.searchGlobal("Joe Jackson");

document.querySelector("select").addEventListener("input", () => {
  const sort = document.querySelector("select").value;
  let sortedView;
  switch (sort) {
    case "cheapest":
      sortedView = myTrackList.sortPricing(+1);
      myTrackList.modViewData(sortedView);
      break;
    case "expensive":
      sortedView = myTrackList.sortPricing(-1);
      myTrackList.modViewData(sortedView);
      break;
    case "artist":
      sortedView = myTrackList.sortByName("artistName", +1);
      myTrackList.modViewData(sortedView);
      break;
    case "reverse":
      sortedView = myTrackList.sortByName("artistName", -1);
      myTrackList.modViewData(sortedView);
    case "songs":
      sortedView = myTrackList.sortByName("trackName", +1);
      myTrackList.modViewData(sortedView);
      break;
    case "songsrev":
      sortedView = myTrackList.sortByName("trackName", -1);
      myTrackList.modViewData(sortedView);
      break;
    case "empty":
      myTrackList.modViewData(myTrackList.data);
  }
});

document.querySelector("input").addEventListener("input", function() {
  const search = document.querySelector("input").value;
  if (search == "") {
    myTrackList.modViewData(myTrackList.data);
  } else {
    myTrackList.filterArtist(search);
  }
});

document.querySelector(".namesort").addEventListener("click", function() {
  const ifSorted =
    myTrackList.viewData[0]["artistName"] <
    myTrackList.viewData[myTrackList.viewData.length - 1]["artistName"];
  console.log(ifSorted);
  if (ifSorted) {
    sortedView = myTrackList.sortByName("artistName", -1);
  } else {
    sortedView = myTrackList.sortByName("artistName", +1);
  }

  myTrackList.modViewData(sortedView);
});

document.querySelector(".request").addEventListener("input", function() {
  const search = document.querySelector(".request").value;
  myTrackList.searchGlobal(search);
});
