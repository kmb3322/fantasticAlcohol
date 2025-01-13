import { Box, Button, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, Text } from "@chakra-ui/react";

interface ResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    resultType: "less" | "more" | "exact" | null;
    resultMessage: string;
    finalImage: string;
    targetVolume: number;
    onRetry: () => void;
    onEnd: () => void;
}

function ResultModal({ isOpen, onClose, resultMessage, finalImage, targetVolume, onRetry, onEnd }: ResultModalProps) {

    const CANVAS_HEIGHT = 200;
    const MAX_VOLUME = 50;

    const targetLineY = (1 - targetVolume / MAX_VOLUME) * CANVAS_HEIGHT;
    // const getTitle = () => {
    //     if (resultType === "less") return "너무 적게 부었어요!";
    //     if (resultType === "more") return "너무 많이 부었어요!";
    //     if (resultType === "exact") return "딱 맞게 부었어요!";
    //     return "결과";
    // };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent p={4} borderRadius="15px">
                {/* <ModalHeader>{getTitle()}</ModalHeader> */}
                <ModalBody>
                    {/* 찍은 사진 + 빨간선(목표 용량) 표시 */}
                    {/* {finalImage && (
                        <Image src={finalImage} alt="찍은 사진" maxW="200px" border="1px solid #ccc" borderRadius="md" mb={4} />
                    )} */}
                    <Box position="relative" mx="auto" w= "150px" h={`${CANVAS_HEIGHT}px`}>
                        <Image src={finalImage} alt="찍은 사진" objectFit="cover" w="full" h="full" />
                        {/* 빨간 선 */}
                        <Box position="absolute" top={`${targetLineY}px`} left={-25} w="200px" h="3px" bg="#F19C7A" />
                    </Box>
                    <Text fontSize="16px" fontWeight={600} textAlign="center" whiteSpace="pre-line">
                        {resultMessage}
                    </Text>
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
