import type { Config } from 'tailwindcss';

/** Tokens del dashboard automotriz (fondo oscuro + acento racing red). */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				ink: '#0a0a0a',
				surface: {
					DEFAULT: '#121212',
					raised: '#1c1c1c'
				},
				line: '#2a2a2a',
				muted: '#a1a1aa',
				accent: {
					DEFAULT: '#e10600',
					hover: '#ff1f14',
					soft: 'rgba(225, 6, 0, 0.16)'
				}
			},
			fontFamily: {
				sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
			},
			boxShadow: {
				glow: '0 0 40px rgba(225, 6, 0, 0.18)',
				card: '0 12px 40px rgba(0, 0, 0, 0.5)'
			}
		}
	}
} satisfies Config;
