import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateShow } from "../actions/showActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

const ShowDropdown = ({ show, findIndex, findLastAiredIndexByDate }) => {
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
  const [epDropdownOpen, setEpDropDownOpen] = useState(false);
  const [seasonData, setSeasonData] = useState("");
  const [episodeData, setEpisodeData] = useState([]);

  const season = String(show.allEpisodes[show.lastSeen][0]).padStart(2, "0");
  const episode = String(show.allEpisodes[show.lastSeen][1]).padStart(2, "0");

  const toggleSeasonDropdown = () =>
    setSeasonDropdownOpen((prevState) => !prevState);
  const toggleEpdropdown = () => setEpDropDownOpen((prevState) => !prevState);
  const dispatch = useDispatch();

  const handleToggle = () => {
    if (epDropdownOpen) {
      toggleEpdropdown();
    } else {
      toggleSeasonDropdown();
    }
  };

  const handleSeasonClick = (season) => {
    setSeasonData(season);
    let now = new Date().setHours(0, 0, 0, 0);
    let dropdownEpisodes = [];

    if (season === "Specials") {
      dropdownEpisodes = show.allEpisodes.filter(
        (item) => item[1] === null && new Date(item[3]) <= now
      );
    } else {
      dropdownEpisodes = show.allEpisodes.filter(
        (item) =>
          item[0] === Number(season) &&
          item[1] !== null &&
          new Date(item[3]).setHours(0, 0, 0, 0) < now
      );
    }

    setEpisodeData(dropdownEpisodes);
    toggleSeasonDropdown();
    toggleEpdropdown();
  };

  // TODO Improve efficiency

  const getDropdownSeasons = (showArr) => {
    let dropdownSeasons = [];
    let specialFound = false;

    for (let i = 0; i < showArr.length; i++) {
      if (showArr[i][1] === null && specialFound === false) {
        specialFound = true;
      }

      if (!dropdownSeasons.includes(showArr[i][0])) {
        dropdownSeasons.push(showArr[i][0]);
      }
    }

    if (specialFound) {
      dropdownSeasons.push("Specials");
    }

    return dropdownSeasons;
  };

  let dropdownSeasons = getDropdownSeasons(show.allEpisodes);

  const handleEpisodeClick = (episode) => {
    dispatch(
      updateShow(show._id, {
        lastSeen: findIndex(
          show.allEpisodes,
          seasonData,
          episode[1],
          episode[2]
        ),
        hasNewSpecial: false,
        remainingNew:
          findLastAiredIndexByDate(show.allEpisodes) -
          findIndex(show.allEpisodes, seasonData, episode[1], episode[2]),
      })
    );

    toggleEpdropdown();
  };

  const DetectOutsideClick = (ref) => {
    useEffect(() => {
      const handleOutsideClick = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setSeasonDropdownOpen(false);
          setEpDropDownOpen(false);
        }
      };

      document.addEventListener("mousedown", handleOutsideClick);
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, [ref]);
  };

  const wrapperRef = useRef(null);
  DetectOutsideClick(wrapperRef);

  return (
    <div className="d-inline-block" ref={wrapperRef}>
      <div
        onClick={handleToggle}
        title="Choose episode from dropdown"
        className="clickable"
      >
        {episode === "null" ? "Special" : "S" + season + "E" + episode}
        <FontAwesomeIcon icon={faCaretDown} className="ml-1" />
      </div>

      {seasonDropdownOpen && (
        <div className="shadow-lg card__dropdown">
          {dropdownSeasons.map((season) => (
            <div
              key={season}
              className="card__dropdownSeasons border m-2 clickable"
              onClick={() => handleSeasonClick(season)}
            >
              {season === "Specials" ? season : "Season " + season}
            </div>
          ))}
        </div>
      )}

      {epDropdownOpen && (
        <div className="shadow-lg card__dropdown">
          <div className="border card__dropdownSeasons selected">
            {seasonData === "Specials" ? seasonData : "Season " + seasonData}
          </div>

          {episodeData.map((episode) => (
            <div
              key={episode[2]}
              className="card__dropdownEpisodes m-2 border clickable"
              onClick={() => handleEpisodeClick(episode)}
            >
              {episode[1] === null ? episode[2] : "Episode " + episode[1]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowDropdown;
