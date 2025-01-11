import React from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Image, Text } from "@chakra-ui/react";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultType: "less" | "more" | "exact" | null;
  resultMessage: string;
  finalImage: string;
  onRetry: () => void;
  onEnd: () => void;
}

function ResultModal({ isOpen, onClose, resultType, resultMessage, finalImage, onRetry, onEnd }: ResultModalProps) {

    const getTitle = () => {
        if (resultType === "less") return "너무 적게 부었어요!";
        if (resultType === "more") return "너무 많이 부었어요!";
        if (resultType === "exact") return "딱 맞게 부었어요!";
        return "결과";
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
            <ModalContent p={4}>
                <ModalHeader>{getTitle()}</ModalHeader>
                <ModalBody>
                    {/* 찍은 사진 + 빨간선(목표 용량) 표시 */}
                    {finalImage && (
                        <Image src={finalImage} alt="찍은 사진" maxW="200px" border="1px solid #ccc" borderRadius="md" mb={4} />
                    )}
                    <Text textAlign="center">{resultMessage}</Text>
                </ModalBody>
                <ModalFooter justifyContent="space-between">
                    <Button variant="outline" onClick={onRetry}>다시 하기</Button>
                    <Button variant="solid" onClick={onEnd}>게임 종료</Button>
                </ModalFooter>
          </ModalContent>
        </Modal>
    );
}

export default ResultModal;
