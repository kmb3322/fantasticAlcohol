import React from "react";
import { Box } from "@chakra-ui/react";

const BeerGlass: React.FC = () => {
  return (
    <Box
      as="svg"
      viewBox="0 0 432 703"
      width="80%"
      height="80%"
      xmlns="http://www.w3.org/2000/svg"
      position="absolute"
      top="10%"
      left="10%"
      preserveAspectRatio="xMidYMid meet"
      pointerEvents="none" // 가이드라인이 클릭을 방해하지 않도록 설정
    >
      <path
        d="M429 3H3L29 700H398L429 3Z"
        stroke="white"
        strokeWidth="5"
        strokeDasharray="30 30"
        fill="none"
      />
    </Box>
  );
}


export default BeerGlass;