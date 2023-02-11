import React, {useState, useMemo, useEffect} from 'react';
import './App.scss';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
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
import kakaopayImage from './static/kakaopay.jpg'
import paypalImage from './static/paypal.jpg';
import buymeacoffeeImage from './static/buymeacoffee.jpg';
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();

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

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error(e);
    }
  }, []);

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
        setWarnMsg(t("message.cannotPlace"));
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
    if(round > 1 && candi.length === 0) setWarnMsg(t("message.impossibleInanna"));
    if(isHellOver(bingo[round])) setWarnMsg(t("message.bombSpecialSkull"));

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
      [t("description.q1"), t("description.a1")],
      [t("description.q2"), t("description.a2")],
      [t("description.q3"), t("description.a3")],
      [t("description.q4"), t("description.a4")],
      [t("description.q5"), t("description.a5")],
      [t("description.q6"), t("description.a6")],
      [t("description.q7"), t("description.a7")],
      [t("description.q8"), t("description.a8")],
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
            <div className="radio-container">
              <FormControl>
                <RadioGroup
                  row
                  onChange={(_, value) => {i18n.changeLanguage(value)}}
                  defaultValue={i18n.resolvedLanguage}
                >
                  <FormControlLabel value="kr" control={<Radio />} label="KR" />
                  <FormControlLabel value="en" control={<Radio />} label="EN" />
                </RadioGroup>
              </FormControl>
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
          <div className="message-warning">
              {t("warning")}
            </div>
          <div className="button-container">
            <div className="button-wrap">
              <Button variant="contained" onClick={resetBingo}>{t("options.reset")}</Button>
            </div>
            <div className="button-wrap">
              <Button variant="contained" className="btn" onClick={cancleBingo}>{t("options.cancel")}</Button>
            </div>
            <FormControlLabel className="check" control={<Checkbox checked={isInanna} onChange={handleInanna} style={{color:'white'}}/>} label={t("options.inanna")} />
            <FormControlLabel className="check" control={<Checkbox checked={isHell} onChange={handleHell} style={{color:'white'}}/>} label={t("options.hell")} />
          </div>
          <div className="slider-container">
            <div className="slider-desc">
              {t("options.skullSlider")}
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
                <FormControlLabel control={<Switch checked={stillListening} onChange={handleSpeech} />} label={t("options.speech")} />
                <div className="speech-script">{transcript}</div>
              </div>) :
              (<div className="message-warning">
                {t("options.speechWarning")}
              </div>)
            }          
          </div>
          <div className="message-desc">
            {`${round < 2
              ? ((round === 0 && isHell) ? t("message.specialSkull") : t("message.initialSkull"))
              : `${round - 1}${t("message.bombNumber")}`} ${t("message.placementTime")}${(!isInanna) && (round % 3 === 1) && (round > 1)? t("message.needBingo") : ""}`}
          </div>
          <div className="message-warning">
            {`${warnMsg}`}
          </div>
        </div>
        <div className="bingo-container">
          {BingoTableView}
        </div>
        <ins className="adsbygoogle"
          style={{display: "block"}}
          data-ad-client="ca-pub-9351793940385765"
          data-ad-slot="5016049614"
          data-ad-format="auto"
          data-full-width-responsive="true">
        </ins>
        {desc()}
        <div className="dona-wrap">
          <div className="dona-box-wrap">
            <a href="https://paypal.me/ialy1595" target="_blank"><img className="dona-image" src={paypalImage} alt=""/></a>
            <a href="https://qr.kakaopay.com/FCxYaD9Ja" target="_blank"><img className="dona-image" src={kakaopayImage} alt=""/></a>
            <a href="https://www.buymeacoffee.com/ialy1595" target="_blank"><img className="dona-image" src={buymeacoffeeImage} alt=""/></a>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default App;
