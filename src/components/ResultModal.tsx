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
          <Box mb="30px">
            <Text fontSize="18px" fontWeight={600} textAlign="center" whiteSpace="pre-line">
              {predictedVolume}ml 따랐네요!
            </Text>
          </Box>
          <Box position="relative" mx="auto" w="150px" h={`${CANVAS_HEIGHT}px`} mb="40px">
            <Image src={finalImage} alt="찍은 사진" objectFit="cover" w="full" h="full" />
          </Box>
          <Box mb="30px">
            <Text fontSize="20px" fontWeight={600} textAlign="center" whiteSpace="pre-line">
              {resultMessage}
            </Text>
          </Box>
        </ModalBody>
        <ModalFooter justifyContent="space-around">
          <Button variant="outline" size="lg" onClick={onRetry}>다시 하기</Button>
          <Button
            variant="solid"
            bg="#F19C7A"
            color="white"
            _hover={{ bg: "#e58c63" }}
            _active={{ bg: "#d16f46" }}
            size="lg"
            onClick={onEnd}>
            게임 종료
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ResultModal;
