import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getShows } from "../actions/showActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

const SortModal = () => {
  const dispatch = useDispatch();
  const sortState = useSelector((state) => state.show.sortState);

  const [selected, setSelected] = useState(sortState[0]);
  const [currSortedBy, setCurrSortedBy] = useState(selected);

  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  const handleSorting = (order) => {
    if (order === "asc") {
      dispatch(getShows(false, selected, 1));
      setCurrSortedBy(selected);
    } else {
      dispatch(getShows(false, selected, -1));
      setCurrSortedBy(selected);
    }
    toggle();
  };

  // If we close the modal without sorting, we reset the selected button to show the currently sorted mode when we next open it.

  const handleClosing = () => {
    setSelected(currSortedBy);
  };

  return (
    <>
      <FontAwesomeIcon
        icon={faSort}
        size="2x"
        onClick={toggle}
        title="Sort"
        className="clickable"
      />

      <Modal isOpen={modal} onClosed={handleClosing} toggle={toggle}>
        <ModalHeader toggle={toggle}>Sorting</ModalHeader>
        <ModalBody>
          <Button
            outline
            color="dark"
            onClick={() => setSelected("dateAdded")}
            active={!selected || selected === "dateAdded"}
            block
          >
            Date Added
          </Button>
          <Button
            outline
            color="dark"
            onClick={() => setSelected("name")}
            active={selected === "name"}
            block
          >
            Name
          </Button>
          <Button
            outline
            color="dark"
            onClick={() => setSelected("remainingNew")}
            active={selected === "remainingNew"}
            block
          >
            Unseen Episodes
          </Button>
          <Button
            outline
            color="dark"
            onClick={() => setSelected("lastEpisode")}
            active={selected === "lastEpisode"}
            block
          >
            Last Episode
          </Button>
          <Button
            outline
            color="dark"
            onClick={() => setSelected("nextEpisode")}
            active={selected === "nextEpisode"}
            block
          >
            Next Episode
          </Button>
          <Button
            outline
            color="dark"
            onClick={() => setSelected("status")}
            active={selected === "status"}
            block
          >
            Status
          </Button>
        </ModalBody>
        <ModalFooter>
          <Button color="dark" onClick={() => handleSorting("asc")}>
            Ascending
          </Button>
          <Button color="dark" onClick={() => handleSorting("desc")}>
            Descending
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default SortModal;
