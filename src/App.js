import React, {useState, useMemo, useEffect} from 'react';
import './App.scss';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import Link from '@mui/material/Link';
import Slider from '@mui/material/Slider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faHome, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import skullImage from './static/skull.png';
import redSkullImage from './static/redskull.png';
import hellSkullImage from './static/hellskull.png';


function App() {
  const [round, setRound] = useState(0);
  const [bingo, setBingo] = useState([[
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
  ]])
  const [isInanna, setIsInanna] = useState(false);
  const [isHell, setIsHell] = useState(false);
  const [hellPos, setHellPos] = useState([-1, -1]);
  const [warnMsg, setWarnMsg] = useState("");
  const [stillListening, setStillListening] = useState(false);
  const [preferSkull, setPreferSkull] = useState(2);
  const scoreWeight = [1e10, 2e9, 1e7, 5e4, 5e4 * 10 * preferSkull + 1e4, 100, 1];

  const transM = (a) => a[0].map((x, c) => a.map(r => r[c]))
  
  const checkBingo = (a) => ({
    row: a.map(x => x.reduce((p , y) => (p && y), true)),
    col: transM(a).map(x => x.reduce((p , y) => (p && y), true)),
    diS: a.reduce((p, x, i) => (p && a[i][i]), true),
    diD:a.reduce((p, x, i) => (p && a[i][4 -i]), true)
  })

  const isRed = (checkRes, x, y) => {
    if(checkRes.row[x] || checkRes.col[y]) return true;
    else if(x === y && checkRes.diS) return true;
    else if(x + y === 4 && checkRes.diD) return true;
    return false;
  }

  const isSkull = (b, x, y) => {
    if(x < 0 || y < 0 || x > 4 || y > 4) return true;
    if(isHell && x === hellPos[0] && y === hellPos[1]) return true;
    if(b[x][y]) return true;
    return false;
  }

  const isIsolate = (b, x, y) => {
    const isSk = (tx, ty) => {
      if(isSkull(b, tx, ty)) return 1;
      return 0
    }
    return isSk(x + 1, y + 1) + isSk(x + 1, y) + isSk(x + 1, y - 1) + isSk(x, y + 1) + isSk(x, y - 1) + isSk(x - 1, y + 1) + isSk(x - 1, y) +isSk(x - 1, y - 1)
  }

  const isHellOver = (b) => {
    if(!isHell) return false;
    if(hellPos[0] < 0 || hellPos[1] < 0) return false;
    return b[hellPos[0]][hellPos[1]];
  }

  const placeBingo = (b, al) => {
    let nowBingo;
    const res = JSON.parse(JSON.stringify(b));
    al.forEach(a => {
      nowBingo = checkBingo(res);
      [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]].forEach(d => {
        const tx = a[0] + d[0];
        const ty = a[1] + d[1];
        if(0 <= tx && tx < 5 && 0 <= ty && ty < 5) {
          if(!isRed(nowBingo, tx, ty)) res[tx][ty] = !res[tx][ty];
        }
      })
    })
    return res;
  }

  const clickBingo = (x, y) => {
    if(x < 0 || x >= 5 || y < 0 || y >= 5) return;
    if(isHell && round === 0) {
      const res = bingo.slice(0, round + 1);
      res.push(JSON.parse(JSON.stringify(bingo[round])));
      setHellPos([x, y])
      setBingo(res);
      setRound(round + 1);
      if(warnMsg !== "") setWarnMsg("");
    }
    else if(round < 2) {
      const res = bingo.slice(0, round + 1);
      if(isSkull(res[round], x, y)) {
        setWarnMsg("다른 위치에 놓아주세요!");
      }
      else {
        res.push(JSON.parse(JSON.stringify(bingo[round])));
        res[round + 1][x][y] = true;
        setBingo(res);
        setRound(round + 1);
        if(warnMsg !== "") setWarnMsg("");
      }
    }
    else {
      if(round % 3 === 1 && isInanna) setIsInanna(false);
      const res = bingo.slice(0, round + 1);
      res.push(placeBingo(bingo[round], [[x, y]]));
      setBingo(res);
      setRound(round + 1);
      if(warnMsg !== "") setWarnMsg("");
    }
  }

  const resetBingo = () => {
    if(warnMsg !== "") setWarnMsg("");
    setRound(0);
    setBingo([[
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
    ]]);
    setIsInanna(false);
    setHellPos([-1, -1])
  }

  const cancleBingo = () => {
    if(warnMsg !== "") setWarnMsg("");
    if(round > 0) setRound(round - 1);
  }

  const scorePlace = (b) => {
    const res = [0, 0, 0, 0];
    const nowBingo = checkBingo(b);
    const check = [
      [false, false, false, false, false],
      [false,  true, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
    ];
    const bfsq = [];

    const isc = [
      [  2,   2,   2,   2, 0.5],
      [  2,  20,  10,   2, 0.5],
      [  2,  10,   7,   2, 0.5],
      [  2,   2,   2,   2, 0.5],
      [0.5, 0.5, 0.5, 0.5, 0.5],
    ]

    bfsq.push([1, 1]);
    for(let s = 0; s < bfsq.length; s++) {
      const tx = bfsq[s][0];
      const ty = bfsq[s][1];
      if(!isRed(nowBingo, tx, ty)) res[0] += 1;
      if(!isSkull(b, tx, ty)) res[1]+= isc[tx][ty];
      if(!isRed(nowBingo, tx, ty)) {
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => {
          const nx = tx + d[0];
          const ny = ty + d[1];
          if(0 <= nx && nx < 5 && 0 <= ny && ny < 5) {
            if((!check[nx][ny]) && (!isRed(nowBingo, nx, ny))) {
              check[nx][ny] = true;
              bfsq.push([nx, ny]);
            }
          }
        })
      }
    }
    [0, 1, 2, 3, 4].forEach(i => {
      [0, 1, 2, 3, 4].forEach(j => {
        if(!isRed(nowBingo, i, j)) res[2] += 1;
        if(!isSkull(b, i, j)) res[3]+= isc[i][j];
      })
    });
    return res;
  }

  const scoreThird = (al) => {
    const res = [];
    // 3빙고, 빨강, 가용, 빈가용, 해골, 총, 총빈
    const nowPlace = placeBingo(bingo[round], al);
    const nowBingo = checkBingo(nowPlace);
    for(let i = 0; i < 5; i++) {
      for(let j = 0; j < 5; j++) {
        const score = [0, 0, 0, 0, 0, 0, 0];
        const testPlace = placeBingo(nowPlace, [[i, j]]);
        const testBingo = checkBingo(testPlace);
        if(!isHellOver(testPlace)) {
          if(JSON.stringify(nowBingo) !== JSON.stringify(testBingo)) score[0] = 1;
          if(!isRed(nowBingo, i, j)) score[1] = 1;
          if(!isSkull(nowPlace, i, j)) score[4] = 1;
          if(isIsolate(nowPlace, i, j) === 8) score[4] = 0;
          const sp = scorePlace(testPlace);
          score[2] = sp[0];
          score[3] = sp[1];
          score[5] = sp[2];
          score[6] = sp[3];
        }
        let sc = 0;
        for(let k = 0; k < 7; k++) sc += score[k] * scoreWeight[k];
        res.push({
          x: i,
          y: j,
          score: sc
        })
      }
    }
    return res;
  }

  const scoreSecond = (al) => {
    const res = [];
    // 빨강, 가용, 빈가용, 해골, 총, 총빈
    const nowPlace = placeBingo(bingo[round], al);
    const nowBingo = checkBingo(nowPlace);
    for(let i = 0; i < 5; i++) {
      for(let j = 0; j < 5; j++) {
        const score = [0, 0, 0, 0, 0, 0, 0];
        const testPlace = placeBingo(nowPlace, [[i, j]]);
        if(!isHellOver(testPlace)) {
          if(!isRed(nowBingo, i, j)) score[0] = 1;
          if(!isSkull(nowPlace, i, j)) score[3] = 1;
          if(isIsolate(nowPlace, i, j) === 8) score[3] = 0;
          const sp = scorePlace(testPlace);
          score[1] = sp[0];
          score[2] = sp[1];
          score[4] = sp[2];
          score[5] = sp[3];
        }
        let sc = 0;
        for(let k = 0; k < 6; k++) sc += score[k] * scoreWeight[k + 1];
        const scThird = isHellOver(testPlace) ? 0 : scoreThird([...al, [i, j]]).reduce((p, x) => Math.max(x.score, p), -1);
        res.push({
          x: i,
          y: j,
          score: sc + scThird
        })
      }
    }
    return res;
  }

  const scoreFirst = () => {
    const res = [];
    // 빨강, 가용, 빈가용, 해골, 총, 총빈
    const nowPlace = bingo[round];
    const nowBingo = checkBingo(nowPlace);
    for(let i = 0; i < 5; i++) {
      for(let j = 0; j < 5; j++) {
        const score = [0, 0, 0, 0, 0, 0, 0];
        const testPlace = placeBingo(nowPlace, [[i, j]]);
        if(!isHellOver(testPlace)) {
          if(!isRed(nowBingo, i, j)) score[0] = 1;
          if(!isSkull(nowPlace, i, i)) score[3] = 1;
          if(isIsolate(nowPlace, i, j) === 8) score[3] = 0;
          const sp = scorePlace(testPlace);
          score[1] = sp[0];
          score[2] = sp[1];
          score[4] = sp[2];
          score[5] = sp[3];
        }
        let sc = 0;
        for(let k = 0; k < 6; k++) sc += score[k] * scoreWeight[k + 1];
        const scSecond = isHellOver(testPlace) ? 0 : scoreSecond([[i, j]]).reduce((p, x) => Math.max(x.score, p), -1);
        res.push({
          x: i,
          y: j,
          score: sc + scSecond
        })
      }
    }
    return res;
  }

  const candidateList = () => {
    const res = [];
    let score;
    if(round % 3 === 2) score = scoreFirst();
    else if(round % 3 === 0) score = scoreSecond([]);
    else score = scoreThird([]);

    const cmp = (x, y) => y.score - x.score;
    const cmpI = (x, y) => (y.score % 1e10) - (x.score % 1e10);

    if(!isInanna) score = score.filter(x => x.score >= 1e10);

    if(isInanna) score.sort(cmpI);
    else score.sort(cmp);

    if(score.length > 0) res.push([score[0].x, score[0].y]);
    if(score.length > 1) res.push([score[1].x, score[1].y]);

    if(score.length > 2) { 
      if(isSkull(bingo[round], score[0].x, score[0].y) && isSkull(bingo[round], score[1].x, score[1].y)) {
        const empt = score.filter(x => !isSkull(bingo[round], x.x, x.y));
        if(empt.length > 0) {
          res.push([empt[0].x, empt[0].y]);
        }
        else {
          res.push([score[2].x, score[2].y]);
        }
      }
      else {
        res.push([score[2].x, score[2].y]);
      }
    }
    return res;
  }

  const BingoTable = () => {
    const res = [];
    const nowBingo = checkBingo(bingo[round]);
    const candi = candidateList();
    if(round > 1 && candi.length === 0) setWarnMsg("무적빙고 불가능! 이난나 or GG");
    if(isHellOver(bingo[round])) setWarnMsg("특수 타일에 해골이...GG");

    for(let i = 0; i < 5; i++) {
      const tds = []
      for(let j = 0; j < 5; j++) {
        let inner;
        if(round !== 0 && i === hellPos[0] && j === hellPos[1]) inner = <img className="bingo-image nodrag" src={hellSkullImage} alt=""/>;
        else if(isRed(nowBingo, i, j)) inner = <img className="bingo-image nodrag" src={redSkullImage} alt=""/>;
        else if (bingo[round][i][j]) inner = <img className="bingo-image nodrag" src={skullImage} alt=""/>;
        else inner = null;

        let cls = "";
        if(round > 1) {
          if(candi.length > 0 && i === candi[0][0] && j === candi[0][1]) cls = "bingo-candidate-1";
          else if(candi.length > 1 && i === candi[1][0] && j === candi[1][1]) cls = "bingo-candidate-2";
          else if(candi.length > 2 && i === candi[2][0] && j === candi[2][1]) cls = "bingo-candidate-3";        
        }

        tds.push(
          <td key={`block${i}${j}`}>
            <div className={`bingo-block ${cls}`} onClick={() => {clickBingo(i, j)}}>
              {inner}
              { stillListening ? 
                (<div className="bingo-coord">
                  {`${i + 1} ${j + 1}`}
                </div>) : null
              }
            </div>
          </td>
        )
      }
      res.push(
        <tr key={`block${i}`}>
          {tds}
        </tr>
      )
    }
    return (
      <div className="bingo-wrap noselect">
        <table>
          <thead>
          </thead>
          <tbody>
            {res}
          </tbody>
        </table>
      </div>
    )
  }

  const BingoTableView = useMemo(BingoTable, [bingo, round, isInanna, stillListening, preferSkull])

  const handleInanna = (e) => {
    setIsInanna(e.target.checked);
  }

  const handleHell = (e) => {
    setIsHell(e.target.checked);
    resetBingo()
  }

  const handlePreferSkull = (e) => {
    setPreferSkull(e.target.value);
  }

  const transNum = (x) => {
    x = `${x}`.replace(/\s+/g, '');
    if(["일", "하나", "1", 1, "열"].includes(x)) return 1;
    if(["이", "둘", "2", 2, "스물"].includes(x)) return 2;
    if(["삼", "셋", "3", 3, "서른"].includes(x)) return 3;
    if(["사", "넷", "4", 4, "마흔"].includes(x)) return 4;
    if(["오", "다섯", "5", 5, "쉰"].includes(x)) return 5;
    return 0;
  }

  const transDoubleNum = (x) => {
    x = `${x}`.replace(/\s+/g, '');
    if(x.length < 2) return;
    if(x.length === 2) return clickBingo(transNum(x[0]) -1 , transNum(x[1]) - 1);
    if(x.split("십").length === 2) return clickBingo(transNum(x.split("십")[0]) -1 , transNum(x.split("십")[1]) - 1);
    if(transNum(x[0]) > 0) return clickBingo(transNum(x[0]) -1 , transNum(x.slice(1, x.length)) - 1);
    if(transNum(x.slice(0, 2)) > 0) return clickBingo(transNum(x.slice(0, 2)) -1 , transNum(x.slice(2, x.length)) - 1);
    return;
  }

  const commands = [
    {
      command: '이난나',
      callback: () => setIsInanna(!isInanna)
    },
    {
      command: '취소',
      callback: () => cancleBingo()
    },
    {
      command: '리셋',
      callback: () => resetBingo()
    },
    {
      command: '폭탄 :i :j',
      callback: (i, j) => clickBingo(transNum(i) -1 , transNum(j) - 1)
    },
    {
      command: '폭탄 :x',
      callback: (x) => transDoubleNum(x)
    },
    {
      command: '음성 해제',
      callback: () => handleSpeech()
    }
  ];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({ commands });

  const handleSpeech = () => {
    if(stillListening) {
      setStillListening(false);
      SpeechRecognition.stopListening();
      resetTranscript();
    }
    else {
      setStillListening(true);
      SpeechRecognition.startListening({ 
        continuous: false,
        language: 'ko'
      });
    }
  }

  const desc = () => {
    const script = [
      [
        `Q. 어떻게 쓰면 되나요?`,
        `처음에 놓인 두 해골 위치를 클릭해서 입력해주세요. 이후 폭탄을 놓을 때마다 그 위치를 클릭해주면 알아서 십자로 적용해줍니다.\n
         잘못 클릭했을 경우 [취소] 버튼으로 되돌릴 수 있고, 처음부터 다시 할 경우 [리셋] 버튼을 누르면 됩니다.`
      ],
      [
        `Q. 폭탄을 어디에 놓아야 좋을지 모르겠어요.`,
        `그런 당신을 위해 추천 기능을 넣었습니다. 빙고 장판 중 파란색 배경인 부분이 추천하는 자리입니다.\n
         일차적으로는 3번째마다 빙고(이하 3빙고)를 할 수 있는지를 고려하고, 그다음엔 위 중앙에 나오는 쿠크에게 딜하기 편한지를 고려합니다.\n
         물론 수식 몇 개로 모든 경우의 수에 완벽한 답을 낼 순 없겠지만 대체로 쓸만할 겁니다 :)\n`
      ],
      [
        `Q. 추천한 자리에 해골이나 망치가 있어요.`,
        `그런 당신을 위해 추천을 3위까지 해드립니다. 더 추천하는 자리일수록 진한 파란색으로 표시됩니다. 또한 가능한 한 세 자리 중 하나는 해골이 없는 자리가 포함되도록 했습니다.`
      ],
      [
        `Q. 폭탄 놓으러 해골 위로 가기 싫어요.`,
        `그런 당신을 위해 해골 위 폭탄 선호도를 조정할 수 있도록 했습니다. 왼쪽으로 갈수록 해골 여부와 상관 없이 추천하고, 오른쪽으로 갈수록 해골 위에 추천이 안 나옵니다. 맨 오른쪽으로 했는데도 해골 위에 추천이 뜨면 정말 그 자리가 좋은겁니다.`
      ],
      [
        `Q. 이번에 이난나 써서 넘길 건데요?`,
        `그런 당신을 위해 이난나 모드를 넣었습니다. 이난나 체크박스를 체크하시면 3빙고를 고려하지 않고 딜하기 편한지만 생각하여 추천해줍니다.\n
         단, 2번 연속으로 이난나를 쓸 경우는 없다고 생각하여 3빙고 타이밍이 지나면 자동으로 이난나 체크가 해제되도록 했습니다.`
      ],
      [
        `Q. 저는 더블모니터가 아닌데요?`,
        `그런 당신을 위해 (아마도) 모바일에서도 보기 편하도록 디자인했습니다. 님폰없?`
      ],
      [
        `Q. 패턴 피하고 딜하느라 바쁜데요?`,
        `그런 당신을 위해 음성인식 모드를 넣었습니다. 음성인식 스위치를 켜면 음성 인식을 시작합니다. 단, 초록색으로 표시되는 인식한 단어를 보면 느끼시겠지만 인식률이 높지는 않아서 천천히 또박또박 말해주셔야 합니다.\n
         만약에 잘 못 알아들었으면 초록색 글씨가 사라지길 기다린 다음 말씀해주시면 됩니다. 지원되는 명령어는 아래와 같습니다.\n
         폭탄 x y: 폭탄 x y: 음성인식 모드를 키면 좌표가 나올 텐데, 폭탄과 놓을 좌표와 함께 말해주시면(e.g. 폭탄 둘 넷) 그 위치를 클릭한 효과를 냅니다. 일이삼사오도 인식은 되도록 했는데 하나둘셋넷다섯이 훨씬훨씬 인식률이 좋을 겁니다. 숫자를 붙여서 두 자릿수로 말 해도 인식이 됩니다. (e.g. 폭탄 이십사 or 폭탄 스물넷)\n
         취소: [취소]버튼과 동일한 효과입니다.\n
         리셋: [리셋]버튼과 동일한 효과입니다.\n
         이난나: 이난나 모드를 on/off 합니다.\n
         음성 해제: 음성인식 모드를 해제합니다.`
      ],
      [
        `Q. 저는 헬 난이도 하고 있는데요?`,
        `그런 당신을 위해 헬모드를 넣었습니다. 처음 클릭에 특수 타일 위치를 클릭하고, 그 다음 클릭에 일반 해골 타일 위치를 클릭하면 됩니다.`
      ]
    ];

    return (<div className="desc-container">
      {script.map((x, i) => (<div key={`desc-${i}`}>
        <div className="desc-question" key={`descq=${i}`}>
          {x[0]}
        </div>
        {x[1].split("\n").map((y, j) => (<div className="desc-answer" key={`desca=${i}${j}`}>{y}</div>))}
      </div>))}
    </div>)
  }


  useEffect(() => {
    if((!listening) && stillListening) {
      resetTranscript();
      SpeechRecognition.startListening({ 
        continuous: false,
        language: 'ko'
      });
    }
  }, [listening])

  return (
    <div>
      <Container maxWidth="sm">
        <div className="tool-container">
          <div className="head-container">
            <div className="message-warning">
              {`※ 처음 오셨다면 아래 문답을 먼저 읽어주세요!`}
            </div>
            <div className="link-container">
              <div className="link-icon">
                <Link href="https://ialy1595.me/" underline="none" color="white">
                  <FontAwesomeIcon icon={faHome} />
                </Link>
              </div>
              <div className="link-icon">
                <Link href="https://github.com/ialy1595/kouku-saton-bingo" underline="none" color="white">
                  <FontAwesomeIcon icon={faGithub} />
                </Link>
              </div>
            </div>
          </div>
          <div className="button-container">
            <div className="button-wrap">
              <Button variant="contained" onClick={resetBingo}>리셋</Button>
            </div>
            <div className="button-wrap">
              <Button variant="contained" className="btn" onClick={cancleBingo}>취소</Button>
            </div>
            <FormControlLabel className="check" control={<Checkbox checked={isInanna} onChange={handleInanna} style={{color:'white'}}/>} label="이난나" />
            <FormControlLabel className="check" control={<Checkbox checked={isHell} onChange={handleHell} style={{color:'white'}}/>} label="헬난이도" />
          </div>
          <div className="slider-container">
            <div className="slider-desc">
              {`해골 위 폭탄`}
            </div>
            <div className="slider-icon">
              <FontAwesomeIcon icon={faThumbsUp} />
            </div>
            <div className="slider-wrap">
              <Slider value={preferSkull} onChange={handlePreferSkull} step={1} marks min={0} max={4} />
            </div>
            <div className="slider-icon">
              <FontAwesomeIcon icon={faThumbsDown} />
            </div>
          </div>
          <div className="button-container">
            { browserSupportsSpeechRecognition ? 
              (<div className="speech">
                <FormControlLabel control={<Switch checked={stillListening} onChange={handleSpeech} />} label="음성 인식" />
                <div className="speech-script">{transcript}</div>
              </div>) :
              (<div className="message-warning">
                {`브라우저가 음성 인식을 지원하지 않습니다.`}
              </div>)
            }          
          </div>
          <div className="message-desc">
            {`${round < 2 ? ((round === 0 && isHell) ? "특수 해골" : "초기 해골") : `${round - 1}번째 폭탄`} 놓을 차례${(!isInanna) && (round % 3 === 1) && (round > 1)? " (무적용 빙고 해야됨!)" : ""}`}
          </div>
          <div className="message-warning">
            {`${warnMsg}`}
          </div>
        </div>
        <div className="bingo-container">
          {BingoTableView}
        </div>
        {desc()}
        <div className="dona-wrap">
          <div className="dona">
            <div className="message-dona">후원하기</div>
            <div className="dona-box-wrap">
              <a href="https://qr.kakaopay.com/FCxYaD9Ja" target="_blank" className="dona-box-kakao">kakao</a>
              <a href="https://toss.me/ialy1595" target="_blank" className="dona-box-toss">toss</a>
            </div>
          </div>          
        </div>
      </Container>
    </div>
  );
}

export default App;