// src/pages/HomePage.tsx
import { Flex, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import SvgButton from '../components/SvgButton';

function HomePage() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" align="center" width="100%"  pt="72px" bg="#ffffff" minWidth="100vw" minHeight="100vh">
      <Text fontSize="34px" textAlign="center" fontWeight={700} fontFamily={'Noto Sans KR'} mb={-2}>
        죽음의 술게임 ❤️
      </Text>
      <Text fontSize="20px" textAlign="center" fontWeight={200} fontFamily={'Noto Sans KR'}>
        soju.monster
      </Text>

      <VStack>
        <VStack align="flex-start" width="full">
          <Text fontSize="20px" mt="30px" textColor="#F19C7A" textAlign="left" fontWeight={700} fontFamily={'Noto Sans KR'}>
            하나의 폰으로 다함께!
          </Text>
          <Text fontSize="12px" fontWeight={250} mt={-3} mb={-5}>
            한 대의 폰으로 재밌는 게임을 시작할 수 있어요
          </Text>

          <Flex direction="row" gap="23px" mt="100px">
            <SvgButton onClick={() => navigate('/drink')} 
              overlayImage="/drink.png"
              overlayText="AI 술 양 맞추기"
              overlaySubtext="술의 신임을 증명해주세요!"
              textColor="#F19C7A"
              />
            <SvgButton onClick={() => navigate('/roulette')}
              overlayImage="/roulette.png"
              overlayText="룰렛 게임"
              overlaySubtext="역시 인생은 복불복!"
              textColor="#F19C7A"
            />
          </Flex>

          <Text fontSize="20px" mt="100px" textColor="#14ACA4" textAlign="left" fontWeight={700} fontFamily={'Noto Sans KR'}>
            각자 폰으로 다함께!
          </Text>
          <Text fontSize="12px" fontWeight={250} opacity={0.65} mt={-3} mb={-5}>
            최대 8대까지 동시에 접속할 수 있어요
          </Text>
          <Flex direction="row" gap="23px" mt="100px">
            <SvgButton
              onClick={() => navigate('/intro', { state: { destination: '/lobby' } })}
              overlayImage="/cat.png"
              overlayText="고양이 잡기"
              overlaySubtext="장난꾸러기 고양이를 혼쭐내주세요!"
            />
            <SvgButton onClick={() => navigate('/balloon/lobby', { state: { destination: '/balloon/game' } })} 
              overlayImage="/balloonicon.png"
              overlayText="풍선 불기"
              overlaySubtext="가장 거대한 풍선을 만들어 봐요!"
              
              />
          </Flex>
        </VStack>
      </VStack>
    </Flex>
  );
}

export default HomePage;
