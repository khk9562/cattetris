import type { CatType } from '../model/types';

export interface CatInfo {
  name: string;
  description: string;
}

export const CAT_INFO: Record<CatType, CatInfo> = {
  ginger: { name: '치즈냥이 (Ginger)', description: '주황 바탕에 진한 줄무늬. 먹보에 애교쟁이' },
  tuxedo: { name: '턱시도 (Tuxedo)', description: '검은 턱시도에 하얀 가슴털. 항상 정장 차림' },
  russianBlue: { name: '러시안블루 (Russian Blue)', description: '은빛 회색 털에 에메랄드빛 눈' },
  calico: { name: '삼색이 (Calico)', description: '흰 바탕에 주황과 검정 얼룩. 대부분 암컷' },
  siamese: { name: '샴 (Siamese)', description: '크림색 몸에 진한 얼굴과 사파이어 눈' },
  black: { name: '까망이 (Black Cat)', description: '칠흑 같은 털에 노란 눈. 행운의 상징' },
  tabby: { name: '고등어 (Brown Tabby)', description: '갈색 바탕의 고등어 줄무늬. 한국 길냥이 대표' },
  darkTabby: { name: '실버태비 (Silver Tabby)', description: '잿빛 바탕에 짙은 줄무늬와 금빛 눈' },
  white: { name: '흰냥이 오드아이 (Odd-eyed White)', description: '순백 털에 파란 눈과 금빛 눈이 하나씩' },
  tortie: { name: '카오스 (Tortoiseshell)', description: '검정과 주황이 뒤섞인 거북등 무늬' },
  bengal: { name: '벵갈 (Bengal)', description: '황금빛 털에 표범 같은 로제트 반점' },
  scottishFold: { name: '스코티시 폴드 (Scottish Fold)', description: '앞으로 접힌 귀와 동그란 얼굴' },
};

/** 이전 호환용 이름 맵 */
export const CAT_NAMES: Record<CatType, string> = Object.fromEntries(
  Object.entries(CAT_INFO).map(([k, v]) => [k, v.name]),
) as Record<CatType, string>;

/** 도감 해금에 필요한 누적 제거 수 */
export const COLLECTION_UNLOCK_THRESHOLD = 500;
