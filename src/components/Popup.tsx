import React from "react";
import { Box, Text, Button, Modal, ModalBody, ModalFooter, ModalHeader, ModalOverlay, ModalContent } from "@chakra-ui/react";


interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    winner: string;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, winner }) => ()
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>당첨</ModalHeader>
            <ModalBody>
                {winner}
            </ModalBody>
            <ModalFooter>
                <Button colorScheme="blue" onClick={onClose}>닫기</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
    );
    export default Popup;
