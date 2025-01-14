import { Box, Button, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, Text } from "@chakra-ui/react";

interface ResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    resultMessage: string;
    finalImage: string;
    predictedVolume: number | null;
    onRetry: () => void;
    onEnd: () => void;
}

function ResultModal({ isOpen, onClose, resultMessage, finalImage, predictedVolume, onRetry, onEnd }: ResultModalProps) {


    const CANVAS_HEIGHT = 200;

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent p={4} borderRadius="15px">
                <ModalBody>
                    {/* 찍은 사진 + 분석 용량 표시 */}
                    <Text fontSize="16px" fontWeight={600} textAlign="center" whiteSpace="pre-line">
                        {predictedVolume}ml 따랐네요!
                    </Text>
                    <Box position="relative" mx="auto" w= "150px" h={`${CANVAS_HEIGHT}px`}>
                        <Image src={finalImage} alt="찍은 사진" objectFit="cover" w="full" h="full" />
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
