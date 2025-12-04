
import { ToolCardData } from './types';

type TFunction = (key: string) => string;

export const getToolCards = (t: TFunction): ToolCardData[] => [
  {
    id: 1,
    imageUrl: 'https://i.pinimg.com/736x/ff/70/f7/ff70f7276c6feb63debbc98bad993489.jpg',
    tag: t('tool_1_tag'),
    title: t('tool_1_title'),
    description: t('tool_1_desc'),
    imageClass: 'object-center'
  },
  {
    id: 14,
    imageUrl: 'https://i.pinimg.com/736x/cf/4b/91/cf4b91dd87d44b5786e5fa496ed69263.jpg', 
    tag: t('tool_14_tag'),
    title: t('tool_14_title'),
    description: t('tool_14_desc'),
    imageClass: 'object-center',
    badge: 'NEW'
  },
  {
    id: 2,
    imageUrl: 'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/1a8fd38f-b2e9-4931-9a9c-c26a2dd4d3a5/original=true,quality=90/85f88a24af726c42ad1f95f380c4da10ebc18c45ef0ff0a25991e32d2a87fa9a.jpeg',
    tag: t('tool_2_tag'),
    title: t('tool_2_title'),
    description: t('tool_2_desc'),
    imageClass: 'object-center'
  },
  {
    id: 3,
    imageUrl: 'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/52a00a82-0d85-44fa-a367-24412fcb9512/anim=false,width=450,optimized=true/460bc4a70567da20d82365cf02c5e9b3251552ebb7b3101a0b229529975503f6.jpeg',
    tag: t('tool_3_tag'),
    title: t('tool_3_title'),
    description: t('tool_3_desc'),
    imageClass: 'object-center'
  },
  {
    id: 4,
    imageUrl: 'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/fb903b68-7ad2-4519-866d-56d8ef8f17e0/anim=false,width=450,optimized=true/2098526-58cde6739ce51447483a2480.jpeg',
    tag: t('tool_4_tag'),
    title: t('tool_4_title'),
    description: t('tool_4_desc'),
    imageClass: 'object-center'
  },
  {
    id: 5,
    imageUrl: 'https://i.pinimg.com/736x/c2/f8/fd/c2f8fdf5ab12e38164fd635882817dc3.jpg',
    tag: t('tool_5_tag'),
    title: t('tool_5_title'),
    description: t('tool_5_desc'),
    imageClass: 'object-center'
  },
  {
    id: 6,
    imageUrl: 'https://i.pinimg.com/736x/1c/16/45/1c16456d213688be2c34a422bab08624.jpg',
    tag: t('tool_6_tag'),
    title: t('tool_6_title'),
    description: t('tool_6_desc'),
    imageClass: 'object-center'
  },
  {
    id: 7,
    imageUrl: 'https://i.pinimg.com/1200x/a6/ce/e6/a6cee607734b85e19a9f252eb2c7d405.jpg',
    tag: t('tool_7_tag'),
    title: t('tool_7_title'),
    description: t('tool_7_desc'),
    imageClass: 'object-center',
    badge: 'VIP'
  },
  {
    id: 8,
    imageUrl: 'https://i.pinimg.com/736x/63/0f/40/630f407d688aef2d92dd8cc01017a319.jpg',
    tag: t('tool_8_tag'),
    title: t('tool_8_title'),
    description: t('tool_8_desc'),
    imageClass: 'object-center'
  },
  {
    id: 9,
    imageUrl: 'https://i.pinimg.com/736x/10/61/4b/10614be47ed494fabebd89abfcb0a0ab.jpg',
    tag: t('tool_9_tag'),
    title: t('tool_9_title'),
    description: t('tool_9_desc'),
    imageClass: 'object-center'
  },
  {
    id: 10,
    imageUrl: 'https://i.pinimg.com/736x/ab/47/3d/ab473d1a7890828984ab86f127dc699a.jpg',
    tag: t('tool_10_tag'),
    title: t('tool_10_title'),
    description: t('tool_10_desc'),
    imageClass: 'object-center'
  }
];
