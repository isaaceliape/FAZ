import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://isaaceliape.github.io/FASE/',
	base: '/docs/',
	integrations: [
		starlight({
			title: 'FASE - Framework de Automação',
			description: 'Documentação completa do FASE (Framework de Automação Sem Enrolação)',
			social: [
				{ href: 'https://github.com/isaaceliape/FASE', icon: 'github', label: 'GitHub' },
			],
			customCss: ['./src/styles/custom.css'],
		}),
	],
});
