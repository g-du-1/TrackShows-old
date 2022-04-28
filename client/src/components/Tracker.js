import React, { Component } from "react";
import { connect } from "react-redux";
import { throttle, debounce } from "lodash";
import Welcome from "./Welcome";
import NavComponent from "./NavComponent";
import Spinner from "./Spinner";
import Search from "./Search";
import Cards from "./Cards";
import Footer from "./Footer";
import {
  getShows,
  addShow,
  updateShow,
  setInitialLoad,
  toggleShowsUpdating,
} from "../actions/showActions";
import { loadUser } from "../actions/authActions";
import TraktLogin from "./TraktLogin";

// TODO move search result state to redux
// Use hooks for new components

class Tracker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "",
      searchResults: [],
      showResults: true,
      searchCache: {},
    };

    this.getDataThrottled = throttle(this.getData, 500);
    this.getDataDebounced = debounce(this.getData, 800);
  }

  async componentDidMount() {
    await this.props.loadUser();
    this.refreshData();
    this.props.setInitialLoad(false);
  }

  handleChange = (event) => {
    this.setState({ value: event.target.value }, () => {
      const query = this.state.value;

      // A combination of throttling and debouncing to keep the requests low but still seem somewhat eager.

      if (query.length < 5 || query.endsWith(" ")) {
        this.getDataDebounced.cancel();
        this.getDataThrottled(query.trim());
      } else {
        this.getDataDebounced(query.trim());
      }

      if (query === "") {
        this.getDataDebounced.cancel();
        this.getDataThrottled.cancel();
        this.setState({ showResults: false });
      }
    });
  };

  getData = (showName) => {
    this.waitingFor = showName;
    const url =
      "https://api.tvmaze.com/search/shows?q=" + showName.replace(/ /g, "+");
    const prevUrl = this.state.searchCache;

    // Don't make a request if it's the same as previous request or it's an empty query.
    if (url === prevUrl || url === "https://api.tvmaze.com/search/shows?q=") {
      return;
    }

    fetch(url).then((response) => {
      if (response.status === 200) {
        if (showName === this.waitingFor) {
          response.json().then((results) => {
            this.setState({
              searchResults: results,
              showResults: true,
              searchCache: url,
            });
          });
        }
      }
    });
  };

  clearResults = () => {
    this.setState({ showResults: false, value: "" });
  };

  getEpisodesSpecialsData = async (id) => {
    // Storing the episodes straight from the API would be too large. Tested on 9k+ episodes. So we create an array with only the data we need.
    // If the episode's number is null in the API it means it's a special.

    // Since there is no numbering for specials and they're not ordered they need to be sorted by date.
    // Only sort if there is at least one special episode in the array. Normal episodes are in order in the api.
    // TODO Improve sorting efficiency

    const response = await fetch(
      "https://api.tvmaze.com/shows/" + id + "/episodes?specials=1"
    );
    const data = await response.json();

    let epsWithSpecials = [];
    let hasSpecial = false;

    data.forEach((episode, index, arr) => {
      if (episode.number === null && hasSpecial === false) {
        hasSpecial = true;
      }

      let currSeason = arr[index].season;
      let nextSeason = null;

      if (index < arr.length - 1) {
        nextSeason = arr[index + 1].season;
      }

      episode.airdate !== "" &&
        epsWithSpecials.push([
          episode.season,
          episode.number,
          episode.name,
          episode.airdate,
          (nextSeason > currSeason && episode.number !== null) ||
          nextSeason === null
            ? "finale"
            : "",
        ]);
    });

    hasSpecial &&
      epsWithSpecials.sort(
        (a, b) =>
          new Date(a[3].replace(/-/g, " ")) - new Date(b[3].replace(/-/g, " "))
      );

    return epsWithSpecials;
  };

  clickResult = async (id) => {
    let alreadyExists = false;

    this.props.show.shows.forEach((show) => {
      if (show.mazeId === String(id)) {
        alreadyExists = true;
        this.clearResults();
        return;
      }
    });

    if (alreadyExists) {
      alert("Show already exists!");
      return;
    }

    // None of the endpoints support getting the special episodes in one response with the rest of the data at the moment so it has to be done seperately.
    // An episode array consists of: index 0: season, index 1: episode number, index 2: episode name, index 3: airdate, index 4: "finale" if the episode is a season finale

    const epsWithSpecials = await this.getEpisodesSpecialsData(id);

    fetch("https://api.tvmaze.com/shows/" + id)
      .then((response) => response.json())
      .then((data) => {
        let lastAiredIndexInArr = this.findLastAiredIndexByDate(
          epsWithSpecials
        );
        this.props.addShow({
          allEpisodes: epsWithSpecials,
          lastSeen: 0,
          remainingNew: lastAiredIndexInArr,
          name: data.name,
          mazeId: data.id,
          lastEpisode: epsWithSpecials[lastAiredIndexInArr][3],
          lastAiredIndexByDate: lastAiredIndexInArr,
          nextEpisode: epsWithSpecials[lastAiredIndexInArr + 1]
            ? epsWithSpecials[lastAiredIndexInArr + 1][3]
            : null,
          status: data.status,
          hasNewSpecial: false,
          thumbnail: data.image.medium,
          user: this.props.auth.user._id,
        });
      });

    this.clearResults();

    window.scrollTo(0, 0);
  };

  // Realisically the worst case is a daily soap with double episodes running since 1998. This means about 10k episodes at the moment.
  // We're trying to find the index of the last aired episode ignoring the episodes that have been ordered but haven't aired yet.
  // A reverse loop will be more efficient since we only have to search through a season or two instead of going from the front.

  findLastAiredIndexByDate = (episodeList) => {
    let today = new Date().setHours(0, 0, 0, 0);
    for (let i = episodeList.length - 1; i >= 0; i--) {
      let currEpDate = new Date(episodeList[i][3]).setHours(0, 0, 0, 0);
      if (currEpDate < today) {
        return i;
      }
    }
  };

  findIndex = (episodeList, season, episode, name = null) => {
    for (let i = episodeList.length - 1; i >= 0; i--) {
      if (
        (episodeList[i][0] === parseInt(season) &&
          episodeList[i][1] === parseInt(episode)) ||
        name === episodeList[i][2]
      ) {
        return i;
      }
    }
  };

  // While updating shows in refreshData: If the tracker is clicked lastSeen doesn't change in the loop so an outside function is needed to get the fresh value.

  getCurrLastSeen = (id) => {
    const { shows } = this.props.show;
    for (let i = 0; i < shows.length; i++) {
      if (shows[i]._id === id) {
        return shows[i].lastSeen;
      }
    }
  };

  getCurrSeason = (id) => {
    const { shows } = this.props.show;
    for (let i = 0; i < shows.length; i++) {
      if (shows[i]._id === id) {
        return shows[i].allEpisodes[shows[i].lastSeen][0];
      }
    }
  };

  getCurrEpisode = (id) => {
    const { shows } = this.props.show;
    for (let i = 0; i < shows.length; i++) {
      if (shows[i]._id === id) {
        return shows[i].allEpisodes[shows[i].lastSeen][1];
      }
    }
  };

  getCurrName = (id) => {
    const { shows } = this.props.show;
    for (let i = 0; i < shows.length; i++) {
      if (shows[i]._id === id) {
        return shows[i].allEpisodes[shows[i].lastSeen][2];
      }
    }
  };

  refreshData = async () => {
    const { shows } = this.props.show;
    this.props.toggleShowsUpdating();
    var epsWithSpecials = [];

    // this.seenAutoUpdate();

    // We first check if the shows episode array is not the same length as the API's episode array (minus episodes without dates). It means episodes have been added and it needs updating.
    // After that we check if the show has any special episodes. A show without any doesn't need sorting. They are in order in the API.
    // Since there is no numbering for specials and they're not ordered they need to be sorted by date.
    // Then we count specials in show and API data for later comparison so we can display a new special badge if there is a new one.

    // Otherwise if the API episode list and the show episode list is the same length it means no new episodes have been added.
    // In this case we check if a new one has aired because if so, we need to update the dates, etc in our database.
    // If last episode in the array is the same as the last aired pointer in the database, check the api because the show might have ended
    // If the show has a new special badge displayed, clear it on next refresh.

    for (const show of shows) {
      fetch(
        "https://api.tvmaze.com/shows/" + show.mazeId + "/episodes?specials=1"
      )
        .then((response) => response.json())
        .then((data) => {
          if (
            data.filter((episode) => episode.airdate !== "").length !==
            show.allEpisodes.length
          ) {
            let hasSpecial = false;

            data.forEach((episode, index, arr) => {
              if (episode.number === null && hasSpecial === false) {
                hasSpecial = true;
              }

              let currSeason = arr[index].season;
              let nextSeason = null;

              if (index < arr.length - 1) {
                nextSeason = arr[index + 1].season;
              }

              episode.airdate !== "" &&
                epsWithSpecials.push([
                  episode.season,
                  episode.number,
                  episode.name,
                  episode.airdate,
                  (nextSeason > currSeason && episode.number !== null) ||
                  nextSeason === null
                    ? "finale"
                    : "",
                ]);
            });

            let specialsInShow = 0;
            let specialsInApiData = 0;

            if (hasSpecial) {
              for (let i = 0; i < show.allEpisodes.length; i++) {
                if (show.allEpisodes[i][1] === null) {
                  specialsInShow++;
                }
              }

              // All the specials are at the front of the array in the API, we break the loop on the first normal episode.

              for (let i = 0; i < data.length; i++) {
                if (data[i].number === null && data[i].airdate !== "") {
                  specialsInApiData++;
                } else if (data[i].number !== null) {
                  break;
                }
              }

              epsWithSpecials.sort(
                (a, b) =>
                  new Date(a[3].replace(/-/g, " ")) -
                  new Date(b[3].replace(/-/g, " "))
              );
            }

            let lastAiredIndexInNewArr = this.findLastAiredIndexByDate(
              epsWithSpecials
            );
            this.props.updateShow(show._id, {
              allEpisodes: epsWithSpecials,
              lastAiredIndexByDate: lastAiredIndexInNewArr,
              lastSeen: this.findIndex(
                epsWithSpecials,
                this.getCurrSeason(show._id),
                this.getCurrEpisode(show._id),
                this.getCurrName(show._id)
              ),
              remainingNew:
                lastAiredIndexInNewArr -
                this.findIndex(
                  epsWithSpecials,
                  this.getCurrSeason(show._id),
                  this.getCurrEpisode(show._id),
                  this.getCurrName(show._id)
                ),
              lastEpisode: epsWithSpecials[lastAiredIndexInNewArr][3],
              nextEpisode: epsWithSpecials[lastAiredIndexInNewArr + 1]
                ? epsWithSpecials[lastAiredIndexInNewArr + 1][3]
                : null,
              hasNewSpecial:
                specialsInShow !== specialsInApiData ? true : false,
            });
          } else {
            let lastAiredIndexInShowArr = this.findLastAiredIndexByDate(
              show.allEpisodes
            );

            if (show.lastAiredIndexByDate !== lastAiredIndexInShowArr) {
              this.props.updateShow(show._id, {
                lastAiredIndexByDate: lastAiredIndexInShowArr,
                remainingNew:
                  lastAiredIndexInShowArr - this.getCurrLastSeen(show._id),
                lastEpisode: show.allEpisodes[lastAiredIndexInShowArr][3],
                nextEpisode: show.allEpisodes[lastAiredIndexInShowArr + 1]
                  ? show.allEpisodes[lastAiredIndexInShowArr + 1][3]
                  : null,
                hasNewSpecial: false,
              });
            }

            if (
              show.lastAiredIndexByDate === show.allEpisodes.length - 1 &&
              show.status !== "Ended"
            ) {
              return fetch("https://api.tvmaze.com/shows/" + show.mazeId)
                .then((response) => response.json())
                .then((data) => {
                  if (data.status !== show.status) {
                    this.props.updateShow(show._id, {
                      status: data.status,
                      hasNewSpecial: false,
                    });
                  }
                });
            } else if (show.hasNewSpecial) {
              this.props.updateShow(show._id, {
                hasNewSpecial: false,
              });
            }
          }
        });

      // API Rate limiting: allows at least 20 calls every 10 seconds. Worst case two calls for each show.
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.props.toggleShowsUpdating();
  };

  // Experimental feature for automatically choosing the last seen episodes. Please note this is unfinished and in a terrible state
  // TODO Change this to use the HTML5 File API.
  // NEGATIVE LOOKBEHIND NOT SUPPORTED IN FIREFOX ATM

  // seenAutoUpdate = () => {
  //   // It's recommended to set play and pause in settings if adding folders
  //   const { shows } = this.props.show;
  //   var names = [];
  //   var times = "";
  //   var toUpdate = [];
  //   var timesToCheck = [];
  //   fetch("http://localhost:5000/api/shows/recents")
  //     .then(response => response.json())
  //     .then(data => {
  //       data.names.map(name => names.push(name.replace(/\./g, " ")));
  //       return data;
  //     })
  //     .then(data => {
  //       times = data.times.split(", ");
  //       return data;
  //     })
  //     .then(data => {
  //       for (let i = 0; i < shows.length; i++) {
  //         // Check for every show
  //         for (let j = 0; j < names.length; j++) {
  //           // For every show check every recently seen
  //           //var nameInArr = names[j].toLowerCase().substr(0, names[j].toLowerCase().indexOf(' s')); // ie Fargo S02E01 -> fargo
  //           var nameInArr = names[j]
  //             .match(/[a-z ]+(?= )(?<! us)/gi)
  //             .join()
  //             .toLowerCase();
  //           var nameInState = shows[i].name.toLowerCase(); // ie the walking dead , fargo etc
  //           if (nameInArr === nameInState.replace(/'/g, "")) {
  //             if (
  //               toUpdate.findIndex(element =>
  //                 element.includes(
  //                   names[j]
  //                     .toLowerCase()
  //                     .substr(0, names[j].toLowerCase().indexOf(" s"))
  //                 )
  //               ) < 0 &&
  //               times[j] === "0"
  //             ) {
  //               toUpdate.push(names[j].toLowerCase());
  //               timesToCheck.push(times[j]);
  //               var found = this.findIndex(
  //                 shows[i].allEpisodes,
  //                 names[j].match(/(?<=s)\d+/gi),
  //                 names[j].match(/(?<=\de)\d+/gi)
  //               );
  //               if (found === undefined) {
  //                 // If the show has only one season
  //                 found = this.findIndex(
  //                   shows[i].allEpisodes,
  //                   1,
  //                   names[j].match(/(?<= e)\d+/gi)
  //                 );
  //               }
  //               var lastAired = this.findIndex(
  //                 shows[i].allEpisodes,
  //                 shows[i].season,
  //                 shows[i].number
  //               );
  //
  //               this.props.updateShow(shows[i]._id, { lastSeen: found, remainingNew: lastAired - found })
  //             }
  //           }
  //         }
  //       }
  //       return data;
  //     });
  // };

  render() {
    const { initialLoad, showsLoading, updating } = this.props.show;
    const { isAuthenticated, user, userLoading } = this.props.auth;

    return (
      <div className="text-center bg-color">
        <NavComponent
          isAuthenticated={isAuthenticated}
          user={user}
          refreshData={this.refreshData}
        />

        {(initialLoad && showsLoading) ||
        userLoading ||
        (isAuthenticated && initialLoad) ? (
          <Spinner />
        ) : isAuthenticated ? (
          <>
            <Search
              handleChange={this.handleChange}
              value={this.state.value}
              searchResults={this.state.searchResults}
              clickResult={this.clickResult}
              showResults={this.state.showResults}
              updating={updating}
              clearResults={this.clearResults}
              refresh={this.refreshData}
            />
            <Cards
              findIndex={this.findIndex}
              findLastAiredIndexByDate={this.findLastAiredIndexByDate}
            />
            <Footer />
          </>
        ) : (
          <>
            <Welcome />
            <TraktLogin />
          </>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  show: state.show,
  auth: state.auth,
});

export default connect(mapStateToProps, {
  addShow,
  getShows,
  updateShow,
  setInitialLoad,
  loadUser,
  toggleShowsUpdating,
})(Tracker);
