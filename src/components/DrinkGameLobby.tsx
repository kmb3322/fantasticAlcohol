import { Box, Button, Image, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function DrinkGameLobby() {
  const navigate = useNavigate();

  return (
    <Box
      w="100%"
      minH="100vh"
      bg="#f9f9f9"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p="30px"
      fontFamily="Noto Sans KR"
    >
      <VStack spacing={8} align="center">
        {/* 메인 타이틀 */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          mb="10px"
        >
          <Image
            width="211px"
            height="94px"
            objectFit="contain"
            mb="2px"
            src="/drink.png"
            alt="drink logo"
          />
          <Text fontWeight={700} fontSize="28px" opacity={0.8} mb="-2px">
            AI 술 양 맞추기
          </Text>
          <Text fontSize="14px" color="#666">
            주어진 용량 이상으로 따르면, 맛있게 마시고 😋
          </Text>
          <Text fontSize="14px" color="#666">
            적게 따르면, 꽉 채워서 마시기☠️
          </Text>
        </Box>

        {/* 게임 선택 버튼들 */}
        <VStack spacing={4} w="100%" maxW="300px">
          {/* 소주 게임 버튼 */}
          <Button
            w="100%"
            h="120px"
            onClick={() => navigate("/drink/soju")}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="xl"
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            transition="all 0.2s"
          >
            <VStack>
              <Image
                src="/soju.png"
                alt="소주"
                w="55px"

              />
              <Text fontWeight={600} color="#F19C7A" mb={-1}>
                소주잔 게임
              </Text>
              <Text fontSize="12px" fontWeight={250} color="gray.500">
                20ml ~ 50ml
              </Text>
            </VStack>
          </Button>

          {/* 맥주 게임 버튼 */}
          <Button
            w="100%"
            h="120px"
            onClick={() => navigate("/drink/beer")}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="xl"
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            transition="all 0.2s"
          >
            <VStack>
              <Image
                src="/beer.png"
                alt="맥주"
                w="55px"

              />
              <Text fontWeight={600} color="#F19C7A" mb={-1}>
                맥주잔 게임
              </Text>
              <Text fontSize="12px" fontWeight={250} color="gray.500">
                100ml ~ 225ml
              </Text>
            </VStack>
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}

export default DrinkGameLobby;