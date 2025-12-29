/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				background: '#FFFFFF',
				foreground: '#0F172A',
				primary: {
					DEFAULT: '#2563EB',
					foreground: '#FFFFFF',
					50: '#EFF6FF',
					100: '#DBEAFE',
					200: '#BFDBFE',
					300: '#93C5FD',
					400: '#60A5FA',
					500: '#3B82F6',
					600: '#2563EB',
					700: '#1D4ED8',
					800: '#1E40AF',
					900: '#1E3A8A',
					950: '#022867',
					1000: '#2454A4',
					1100: '#103A81',
					1200: '#041531',
					1300: '#748095'
				},
				secondary: {
					DEFAULT: '#71717A',
					foreground: '#FFFFFF',
					50: '#FAFAFA',
					100: '#F4F4F5',
					200: '#E4E4E7',
					300: '#D4D4D8',
					400: '#A1A1AA',
					500: '#71717A',
					600: '#52525B',
					700: '#3F3F46',
					800: '#27272A',
					900: '#18181B'
				},
				blue: {
					50: '#F7F9FF',
					100: '#EFF5FF',
					150: '#DFE9FA',
					200: '#CFF5FFA',
					300: '#C4D5F1',
					350: '#F7FAFF',
					400: '#5B7FEB',
					500: '#2454A4',
					600: '#0F3A82',
					700: '#022867',
					800: '#052151'
				},
				gray: {
					50: '#EFF4FC',
					100: '#FFFFFF',
					150: '#DFE9FA',
					200: '#F3F5FC',
					250: '#E6E9EE',
					300: '#F0F2F5',
					400: '#E4E6EE',
					500: '#D0D3DA',
					600: '#A8B3C1',
					700: '#748095',
					800: '#5B687D',
					850: '#FBFCFC'
				},
				utility: {
					orange400: '#F7903E',
					green500: '#0A6555',
					red500: '#BA082B',
					turquoise400: '#59B3C6',
					green50: '#E5ECEB',
					red50: '#F0E1E5',
					turquoise50: '#DEF0F4'
				},
				gradient: {
					blue: '#2454A4',
					fade: '#000000'
				},
				tabInactiveColor: {
					500: '#ABB3C1'
				}
			},
			fontFamily: {
				AvenirRoman: ['Avenir-Roman'],
				AvenirMedium: ['Avenir-Medium'],
				AvenirHeavy: ['Avenir-Heavy'],
				TradeGothicNextProCn: ['TradeGothicNextLTPro-Cn'],
				TradeGothicNextProBdCn: ['TradeGothicNextLTPro-BdCn']
			},
			fontWeight: {
				300: 300,
				400: 400,
				500: 500,
				600: 600,
				700: 700
			}
		}
	},
	plugins: []
}
