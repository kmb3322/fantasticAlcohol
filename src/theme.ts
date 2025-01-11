// client/src/theme.ts
import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const customTheme = extendTheme({
  config,
  colors: {
    brand: {
      red: '#E60012',   // 닌텐도 레드
      gray: '#8b8b8b',
      dark: '#2C2C2C',
    },
  },
  styles: {
    global: {
      'html, body': {
        backgroundColor: '#f9f9f9',
        color: '#2C2C2C',
        margin: 0,
        padding: 0,
        fontFamily: `'Noto Sans KR', 'Trebuchet MS', 'Helvetica Neue', sans-serif`,
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: '999px', // 둥근 버튼(조이콘 느낌)
        fontWeight: 'bold',
      },
      sizes: {
        lg: {
          h: '50px',
          fontSize: 'lg',
          px: '32px',
        },
      },
      variants: {
        solidRed: {
          bg: 'brand.red',
          color: 'white',
          _hover: {
            bg: '#c6000e',
          },
          _active: {
            bg: '#aa000c',
          },
        },
      },
    },
  },
});

export default customTheme;
