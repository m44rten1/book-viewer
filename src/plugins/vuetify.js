/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'library',
    themes: {
      library: {
        dark: false,
        colors: {
          background: '#F5F5F0',
          surface: '#FFFFFF',
          primary: '#2E7D6F',
          'primary-darken-1': '#1B5E50',
          secondary: '#7C8A97',
          'secondary-darken-1': '#546E7A',
          error: '#D32F2F',
          info: '#1976D2',
          success: '#388E3C',
          warning: '#F9A825',
        },
      },
    },
  },
})
