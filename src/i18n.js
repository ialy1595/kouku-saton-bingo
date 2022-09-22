import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'kr',
    resources: {
      kr: {
        translation: {
          donate: "후원하기",
          warning: "※ 처음 오셨다면 아래 문답을 먼저 읽어주세요!",
          options: {
            reset: "리셋",
            cancel: "취소",
            inanna: "이난나",
            hell: "헬난이도",
            skullSlider: "해골 위 폭탄",
            speech: "음성 인식",
            speechWarning: "브라우저가 음성 인식을 지원하지 않습니다.",
          },
          message: {
            specialSkull: "특수 해골",
            initialSkull: "초기 해골",
            bombNumber: "번째 폭탄",
            placementTime: "놓을 차례",
            needBingo: " (무적용 빙고 해야됨!)",
            cannotPlace: "다른 위치에 놓아주세요!",
            impossibleInanna: "무적빙고 불가능! 이난나 or GG",
            bombSpecialSkull: "특수 타일에 해골이...GG",
          },
          description: {
            q1: "Q. 어떻게 쓰면 되나요?",
            a1: "처음에 놓인 두 해골 위치를 클릭해서 입력해주세요. 이후 폭탄을 놓을 때마다 그 위치를 클릭해주면 알아서 십자로 적용해줍니다.\n" + 
            "잘못 클릭했을 경우 [취소] 버튼으로 되돌릴 수 있고, 처음부터 다시 할 경우 [리셋] 버튼을 누르면 됩니다.",
            q2: "Q. 폭탄을 어디에 놓아야 좋을지 모르겠어요.",
            a2: "그런 당신을 위해 추천 기능을 넣었습니다. 빙고 장판 중 파란색 배경인 부분이 추천하는 자리입니다.\n" + 
            "일차적으로는 3번째마다 빙고(이하 3빙고)를 할 수 있는지를 고려하고, 그다음엔 위 중앙에 나오는 쿠크에게 딜하기 편한지를 고려합니다.\n" +
            "물론 수식 몇 개로 모든 경우의 수에 완벽한 답을 낼 순 없겠지만 대체로 쓸만할 겁니다 :)",
            q3: "Q. 추천한 자리에 해골이나 망치가 있어요.",
            a3: "그런 당신을 위해 추천을 3위까지 해드립니다. 더 추천하는 자리일수록 진한 파란색으로 표시됩니다. 또한 가능한 한 세 자리 중 하나는 해골이 없는 자리가 포함되도록 했습니다.",
            q4: "Q. 폭탄 놓으러 해골 위로 가기 싫어요.",
            a4: "그런 당신을 위해 해골 위 폭탄 선호도를 조정할 수 있도록 했습니다. 왼쪽으로 갈수록 해골 여부와 상관 없이 추천하고, 오른쪽으로 갈수록 해골 위에 추천이 안 나옵니다. 맨 오른쪽으로 했는데도 해골 위에 추천이 뜨면 정말 그 자리가 좋은겁니다.",
            q5: "Q. 이번에 이난나 써서 넘길 건데요?",
            a5: "그런 당신을 위해 이난나 모드를 넣었습니다. 이난나 체크박스를 체크하시면 3빙고를 고려하지 않고 딜하기 편한지만 생각하여 추천해줍니다.\n" + 
            "단, 2번 연속으로 이난나를 쓸 경우는 없다고 생각하여 3빙고 타이밍이 지나면 자동으로 이난나 체크가 해제되도록 했습니다.",
            q6: "Q. 저는 더블모니터가 아닌데요?",
            a6: "그런 당신을 위해 (아마도) 모바일에서도 보기 편하도록 디자인했습니다. 님폰없?",
            q7: "Q. 패턴 피하고 딜하느라 바쁜데요?",
            a7: "그런 당신을 위해 음성인식 모드를 넣었습니다. 음성인식 스위치를 켜면 음성 인식을 시작합니다. 단, 초록색으로 표시되는 인식한 단어를 보면 느끼시겠지만 인식률이 높지는 않아서 천천히 또박또박 말해주셔야 합니다.\n" + 
            "만약에 잘 못 알아들었으면 초록색 글씨가 사라지길 기다린 다음 말씀해주시면 됩니다. 지원되는 명령어는 아래와 같습니다.\n" +
            "폭탄 x y: 폭탄 x y: 음성인식 모드를 키면 좌표가 나올 텐데, 폭탄과 놓을 좌표와 함께 말해주시면(e.g. 폭탄 둘 넷) 그 위치를 클릭한 효과를 냅니다. 일이삼사오도 인식은 되도록 했는데 하나둘셋넷다섯이 훨씬훨씬 인식률이 좋을 겁니다. 숫자를 붙여서 두 자릿수로 말 해도 인식이 됩니다. (e.g. 폭탄 이십사 or 폭탄 스물넷)\n" +
            "취소: [취소]버튼과 동일한 효과입니다.\n" +
            "리셋: [리셋]버튼과 동일한 효과입니다.\n" +
            "이난나: 이난나 모드를 on/off 합니다.\n" +
            "음성 해제: 음성인식 모드를 해제합니다.",
            q8: "Q. 저는 헬 난이도 하고 있는데요?",
            a8: "그런 당신을 위해 헬모드를 넣었습니다. 처음 클릭에 특수 타일 위치를 클릭하고, 그 다음 클릭에 일반 해골 타일 위치를 클릭하면 됩니다.",
          },
        },
      },
      en: {
        translation: {
          donate: "Donate",
          warning: "※ First-time users: please read the Q&A below!",
          options: {
            reset: "reset",
            cancel: "undo",
            inanna: "Inanna Ready",
            hell: "Hell Mode (KR only)",
            skullSlider: "Place bombs on skulls?",
            speech: "Speech recognition (KR only)",
            speechWarning: "Your browser does not support speech recognition.",
          },
          message: {
            specialSkull: "Special (Hell) skull",
            initialSkull: "Initial skull",
            bombNumber: "-round bomb",
            placementTime: "placement",
            needBingo: " (Need bingo!)",
            cannotPlace: "Cannot place skull there!",
            impossibleInanna: "Bingo impossible! Inanna or GG",
            bombSpecialSkull: "Bomb on special skull...GG",
          },
          description: {
            q1: "Q. How do I use the tool?",
            a1: "Click on the positions of the initial two skulls. After, click on any position to place a bomb. Every time you place a bomb, it will automatically flip adjacent tiles.\n" +
            "If you put the bomb in the wrong tile, you can go back with the [UNDO] button, and if you want to reset the board, just click the [RESET] button.",
            q2: "Q. Where should I put the bombs?",
            a2: "The tool has a recommendation feature. Recommended tiles are marked with blue colors.\n" +
            "The recommendation logic prioritizes playing a bingo every 3rd round, followed by keeping the middle-top board clean for easy DPS.\n" +
            "Of course, a few formulas won't give the perfect answer for every possible combination, but it's generally usable :)",
            q3: "Q. What should I do if there's a skull or hammer in the recommended spot?",
            a3: "For flexibility, up to 3 recommendations are provided. The more recommended positions are displayed in dark blue, but the lighter blue spots are fine too. Also, whenever possible, we try to ensure that at least one of the three positions contains no skull.",
            q4: "Q. What if I don't want to stand on skulls to put the bombs?",
            a4: "You can adjust your preferences for bombs on skulls using the slider. The left side would not consider skulls at all, while the right side would avoid skulls as much as possible. If you put the slider the right side and still skull tiles are recommended, it means that you should really go for it.",
            q5: "Q. What if I plan to use Inanna?",
            a5: "There is an Inanna checkbox. If it is checked, the tool WILL NOT TRY TO MAKE A BINGO for the upcoming wipe and instead optimize the board for easy DPS.\n" +
            "However, since there is no situation where you can use Inanna twice in a row, the Inanna checkbox will become unchecked after using it to pass a wipe with no bingo.",
            q6: "Q. I don't have two monitors, can I still use this tool?",
            a6: "I designed the tool to be easy to view and use on mobile. DO YOU GUYS NOT HAVE PHONES?",
            q7: "Q. How can I use the tool if I'm busy avoiding patterns?",
            a7: "There is a voice recognition mode. However, it's not available for EN.",
            q8: "Q. What if I'm playing hell mode?",
            a8: "There is a hell mode checkbox. The first click on the grid will place the special skull tile, then the next click will place a normal skull tile.",
          },
        },
      }
    }
  });

export default i18n;
