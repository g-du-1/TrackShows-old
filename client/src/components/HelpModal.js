import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  NavLink,
  Button,
} from "reactstrap";

const HelpModal = () => {
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  return (
    <>
      <NavLink href="#" className="px-2 secondary-textcolor" onClick={toggle}>
        Help
      </NavLink>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader>Help</ModalHeader>
        <ModalBody>
          <p>
            Set the last episode seen for each show using the dropdown or the
            arrows.
          </p>
          <p>
            <span className="badge badge-danger mr-1">22</span>Unseen episodes -
            click on the badge to set the tracker to the last aired episode.
          </p>
          <p>
            <span className="badge badge-info mr-1">SF</span>
            Season finale.
          </p>
          <p>
            <span className="badge badge-warning mr-1">S</span>
            New special - click to clear notification.
          </p>
          <p>Next: counts down to the next episode if it's date is known.</p>
          <p>
            Last: displays the last episode's airdate if there's no date for the
            next episode yet.
          </p>
          <p>Status: displays "Ended" if the show has ended.</p>
        </ModalBody>
        <ModalFooter>
          <Button color="dark" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default HelpModal;
