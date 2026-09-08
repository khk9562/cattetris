export type CatType =
  | 'ginger'
  | 'tuxedo'
  | 'russianBlue'
  | 'calico'
  | 'siamese'
  | 'black'
  | 'tabby'
  | 'darkTabby'
  | 'white'
  | 'tortie'
  | 'bengal'
  | 'scottishFold';

export const ALL_CAT_TYPES: CatType[] = [
  'ginger',
  'tuxedo',
  'russianBlue',
  'calico',
  'siamese',
  'black',
  'tabby',
  'darkTabby',
  'white',
  'tortie',
  'bengal',
  'scottishFold',
];

/** 얼굴 요소(눈, 입)를 밝은 색으로 그려야 하는 어두운 털색 품종 */
export const DARK_CAT_TYPES: CatType[] = ['black', 'russianBlue', 'tortie'];
