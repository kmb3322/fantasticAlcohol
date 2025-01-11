import React from 'react';
import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    return (
        <VStack spacing={6} p={8}>
            <Text fontSize="3xl" fontWeight="bold">
                소주게임에 오신 것을 환영합니다!
            </Text>
            <Button colorScheme="teal" size="lg" onClick={() => navigate('/soju')}>
            </Button>
        </VStack>
    );
}

export default Home;
