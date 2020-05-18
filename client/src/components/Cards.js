import React, { Component } from "react";
import { connect } from "react-redux";
import ShowDropdown from "./ShowDropdown";
import { deleteShow, getShows, updateShow } from "../actions/showActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimesCircle,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

class Cards extends Component {
  handleStatusLogic = (next, last, status) => {
    if (status === "Ended" || status === "In Development") {
      return `Status: ${status}`;
    }

    if (
      next === null &&
      (status === "Running" || status === "To Be Determined")
    ) {
      return `Last: ${last}`;
    }

    let differenceToNow = new Date(next).getTime() - new Date().getTime();
    let days = Math.floor(differenceToNow / (1000 * 60 * 60 * 24)) + 1;

    if (days < 0) {
      return "Updating...";
    } else if (days === 0) {
      return "Next: Airing today!";
    } else if (days === 1) {
      return `Next: ${days} day`;
    } else {
      return `Next: ${days} days`;
    }
  };

  render() {
    const { shows, showsLoading, modifyingCards } = this.props.show;

    return (
      <div
        className="cards-section"
        style={
          showsLoading || modifyingCards
            ? {
                opacity: "50%",
                pointerEvents: "none",
                transition: "opacity .5s",
              }
            : null
        }
      >
        {shows.map((show) => {
          let id = show._id;
          let lastAiredIndex = this.props.findLastAiredIndexByDate(
            show.allEpisodes
          );
          let remainingNew = show.remainingNew;
          let hasNewSpecial = show.hasNewSpecial;
          let lastSeen = show.lastSeen;
          let episodeName = show.allEpisodes[lastSeen][2];

          return (
            <div
              className="card__container text-center shadow my-3 noselect"
              key={id}
            >
              <FontAwesomeIcon
                icon={faTimesCircle}
                onClick={() => this.props.deleteShow(id)}
                title="Delete"
                className="clickable card__delete-btn"
              />

              <div>
                {remainingNew > 0 && (
                  <span
                    onClick={() =>
                      this.props.updateShow(id, {
                        lastSeen: lastAiredIndex,
                        remainingNew: 0,
                      })
                    }
                    title="Set last aired episode as last seen"
                    className="badge badge-danger clickable card__badge-remaining"
                  >
                    {remainingNew}
                  </span>
                )}

                {hasNewSpecial && (
                  <span
                    onClick={() =>
                      this.props.updateShow(id, {
                        hasNewSpecial: false,
                      })
                    }
                    title="Clear new special notification"
                    className="badge badge-warning clickable card__badge-special"
                  >
                    S
                  </span>
                )}

                <img
                  src={show.thumbnail}
                  className="border"
                  width="90px"
                  alt="thumbnail"
                />
              </div>

              <div className="card__text-container">
                <div className="turnicate font-weight-bold">{show.name}</div>

                <div className="noselect card__tracker-container d-inline-block">
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    title="Set previous episode as last seen"
                    className="clickable mr-icon"
                    onClick={() =>
                      show.lastSeen > 0 &&
                      this.props.updateShow(id, {
                        lastSeen: lastSeen - 1,
                        remainingNew: remainingNew + 1,
                        hasNewSpecial: false,
                      })
                    }
                  />

                  <ShowDropdown
                    show={show}
                    findIndex={this.props.findIndex}
                    findLastAiredIndexByDate={
                      this.props.findLastAiredIndexByDate
                    }
                  />

                  <FontAwesomeIcon
                    icon={faArrowRight}
                    title="Set next episode as last seen"
                    className="clickable ml-icon"
                    onClick={() =>
                      lastSeen < lastAiredIndex &&
                      this.props.updateShow(id, {
                        lastSeen: lastSeen + 1,
                        remainingNew: remainingNew - 1,
                        hasNewSpecial: false,
                      })
                    }
                  />
                </div>

                <div className="small-font turnicate">
                  {show.allEpisodes[lastSeen][4] === "finale" && (
                    <span
                      title="Season Finale"
                      className="badge badge-info mr-1"
                    >
                      SF
                    </span>
                  )}
                  {episodeName}
                </div>

                <div className="small-font">
                  {this.handleStatusLogic(
                    show.nextEpisode,
                    show.lastEpisode,
                    show.status
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  show: state.show,
});

export default connect(mapStateToProps, {
  deleteShow,
  getShows,
  updateShow,
})(Cards);
