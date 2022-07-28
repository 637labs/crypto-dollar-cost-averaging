import { ThemeProvider } from '@material-ui/core/styles';

import '../src/css/index.css';
import '../src/css/App.css';
import theme from '../src/theme';

export const decorators = [
  (Story) => (
    <ThemeProvider theme={theme}>
      {Story()}
    </ThemeProvider>
  ),
];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}