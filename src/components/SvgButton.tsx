// SvgButton.tsx
import { Box, Button, Image, Text } from '@chakra-ui/react';
import { FC } from 'react';

interface SvgButtonProps {
  onClick: () => void;
  overlayImage?: string;  // 추가: 오버레이 이미지 URL
  overlayText?: string;
  overlaySubtext?: string;
  textColor?: string;  // 추가: 텍스트 색상 prop
}

const SvgButton: FC<SvgButtonProps> = ({ onClick,
  overlayImage,
  overlayText,
  overlaySubtext,
  textColor }) => {
  return (
    <Box position="relative" display="inline-block">
      <Button
        onClick={onClick}
        padding={0}
        background="transparent"
        _hover={{ background: 'transparent' }}
        _active={{ background: 'transparent' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="173"
          height="232"
          viewBox="0 0 173 232"
          fill="none"
          style={{
            fill: '#FBFBFB',
            filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.10))',
          }}
        >
          <g filter="url(#filter0_d_8_2610)">
            <path d="M3 31C3 16.8579 3 9.7868 7.3934 5.3934C11.7868 1 18.8579 1 33 1H140C154.142 1 161.213 1 165.607 5.3934C170 9.7868 170 16.8579 170 31V197C170 211.142 170 218.213 165.607 222.607C161.213 227 154.142 227 140 227H33C18.8579 227 11.7868 227 7.3934 222.607C3 218.213 3 211.142 3 197V31Z" />
          </g>
          <defs>
            <filter
              id="filter0_d_8_2610"
              x="0"
              y="0"
              width="173"
              height="232"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="2" />
              <feGaussianBlur stdDeviation="1.5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_8_2610"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_8_2610"
                result="shape"
              />
            </filter>
          </defs>
        </svg>
      </Button>

      {/* overlayImage가 있을 경우 렌더링 */}
      {overlayImage && (
        <Image
          src={overlayImage}
          alt="Overlay"
          position="absolute"
          top="-14px"
          left="0"
          width="100%"
          height="100%"
          objectFit="contain"
          pointerEvents="none"  // 버튼 클릭 방해 안하도록
        />
      )}
      {/* Overlay 텍스트와 서브텍스트 */}
      {(overlayText || overlaySubtext) && (
        <Box
          position="absolute"
          top="100%"
          left="50%"
          width="100%"
          transform="translate(-50%, -50%)"
          textAlign="center"
          pointerEvents="none"

        >
          {overlayText && (
            <Text fontSize="14px"
              textColor={textColor || "#14ACA4"}
              fontWeight={700}
              mt="5px"
              fontFamily={'Noto Sans KR'}
            >
              {overlayText}
            </Text>
          )}
          {overlaySubtext && (
            <Text fontSize="8px" fontFamily={'Noto Sans KR'} fontWeight={250} >
              {overlaySubtext}
            </Text>
          )}
        </Box>
      )}


    </Box>
  );
};

export default SvgButton;
