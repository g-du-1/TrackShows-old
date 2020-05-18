import React, { useEffect, useRef } from "react";
import SortModal from "./SortModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";

export default function Search(props) {
  const DetectOutsideClick = (ref) => {
    useEffect(() => {
      const handleOutsideClick = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          props.clearResults();
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
    <div className="mt-3 search__container" ref={wrapperRef}>
      <form className="mb-1 form-inline search__form">
        <div className="mx-auto">
          {props.updating ? (
            <FontAwesomeIcon
              icon={faSyncAlt}
              size="lg"
              title="Refresh data"
              className="fa-spin clickable"
            />
          ) : (
            <FontAwesomeIcon
              icon={faSyncAlt}
              size="lg"
              title="Refresh data"
              onClick={props.refresh}
              className="clickable"
            />
          )}
        </div>

        <input
          className="form-control"
          value={props.value}
          onChange={props.handleChange}
          placeholder="Search to add TV Shows"
          style={{ width: "356.25px", maxWidth: "65%" }}
        />

        <div className="mx-auto">
          <SortModal />
        </div>
      </form>

      {props.showResults ? (
        <div className="shadow-lg mt-2 search__result-list">
          {props.searchResults
            .filter(
              (show) => show.show.image !== null && show.show.premiered !== null
            )
            .map((show) => {
              return (
                <div
                  key={show.show.id}
                  className="d-flex m-2 border text-left align-items-center search__result clickable"
                  onClick={() => {
                    props.clickResult(show.show.id);
                  }}
                >
                  <div className="mr-2">
                    <img
                      src={show.show.image.medium.replace(/http/, "https")}
                      alt="poster"
                      height="100"
                      width="70"
                    />
                  </div>
                  <div>
                    {show.show.name} ({show.show.premiered.split("-")[0]})
                  </div>
                </div>
              );
            })}
        </div>
      ) : null}
    </div>
  );
}
