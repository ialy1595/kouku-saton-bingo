import React, {useState, useMemo} from 'react';
import './App.scss';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import skullImage from './static/skull.png';
import redSkullImage from './static/redskull.png';


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
  const [warnMsg, setWarnMsg] = useState("");

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
    if(round < 2) {
      const res = bingo.slice(0, round + 1);
      if(res[round][x][y]) {
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
      [false, true, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
    ];
    const bfsq = [];
    const isc = (x, y) => 4 - 0.5 * Math.max(Math.abs(x - 1), Math.abs(y - 1));

    bfsq.push([1, 1]);
    for(let s = 0; s < bfsq.length; s++) {
      const tx = bfsq[s][0];
      const ty = bfsq[s][1];
      if(!isRed(nowBingo, tx, ty)) res[0] += isc(tx, ty);
      if(!b[tx][ty]) res[1]+= isc(tx, ty);
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
        if(!isRed(nowBingo, i, j)) res[2] += isc(i, j);
        if(!b[i][j]) res[3]+= isc(i, j);
      })
    });
    return res;
  }

  const scoreThird = (al) => {
    const res = [];
    // 3빙고, 빨강, 가용, 해골, 빈가용, 총, 총빈
    const scoreWeight = [1e10, 2e9, 1e7, 2e6, 1e4, 100, 1];
    const nowPlace = placeBingo(bingo[round], al);
    const nowBingo = checkBingo(nowPlace);
    for(let i = 0; i < 5; i++) {
      for(let j = 0; j < 5; j++) {
        const score = [0, 0, 0, 0, 0, 0, 0];
        const testPlace = placeBingo(nowPlace, [[i, j]]);
        const testBingo = checkBingo(testPlace);
        if(JSON.stringify(nowBingo) !== JSON.stringify(testBingo)) score[0] = 1;
        if(!isRed(nowBingo, i, j)) score[1] = 1;
        if(!nowPlace[i][j]) score[4] = 1;
        const sp = scorePlace(testPlace);
        score[2] = sp[0];
        score[3] = sp[1];
        score[5] = sp[2];
        score[6] = sp[3];
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
    // 빨강, 가용, 해골, 빈가용, 총, 총빈
    const scoreWeight = [2e9, 1e7, 2e6, 1e4, 100, 1];;
    const nowPlace = placeBingo(bingo[round], al);
    const nowBingo = checkBingo(nowPlace);
    for(let i = 0; i < 5; i++) {
      for(let j = 0; j < 5; j++) {
        const score = [0, 0, 0, 0, 0, 0, 0];
        const testPlace = placeBingo(nowPlace, [[i, j]]);
        if(!isRed(nowBingo, i, j)) score[0] = 1;
        if(!nowPlace[i][j]) score[3] = 1;
        const sp = scorePlace(testPlace);
        score[1] = sp[0];
        score[2] = sp[1];
        score[4] = sp[2];
        score[5] = sp[3];
        let sc = 0;
        for(let k = 0; k < 6; k++) sc += score[k] * scoreWeight[k];
        const scThird = scoreThird([...al, [i, j]]).reduce((p, x) => Math.max(x.score, p), -1);
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
    // 빨강, 가용, 해골, 빈가용, 총, 총빈
    const scoreWeight = [2e9, 1e7, 2e6, 1e4, 100, 1];;
    const nowPlace = bingo[round];
    const nowBingo = checkBingo(nowPlace);
    for(let i = 0; i < 5; i++) {
      for(let j = 0; j < 5; j++) {
        const score = [0, 0, 0, 0, 0, 0, 0];
        const testPlace = placeBingo(nowPlace, [[i, j]]);
        if(!isRed(nowBingo, i, j)) score[0] = 1;
        if(!nowPlace[i][j]) score[3] = 1;
        const sp = scorePlace(testPlace);
        score[1] = sp[0];
        score[2] = sp[1];
        score[4] = sp[2];
        score[5] = sp[3];
        let sc = 0;
        for(let k = 0; k < 6; k++) sc += score[k] * scoreWeight[k];
        const scSecond = scoreSecond([[i, j]]).reduce((p, x) => Math.max(x.score, p), -1);
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
      if(bingo[round][score[0].x][score[0].y] && bingo[round][score[1].x][score[1].y]) {
        const empt = score.filter(x => !bingo[round][x.x][x.y]);
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

    for(let i = 0; i < 5; i++) {
      const tds = []
      for(let j = 0; j < 5; j++) {
        let inner;
        if(isRed(nowBingo, i, j)) inner = <img className="bingo-image nodrag" src={redSkullImage} alt=""/>;
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

  const BingoTableView = useMemo(BingoTable, [bingo, round, isInanna])

  const handleInanna = (e) => {
    setIsInanna(e.target.checked);
  }

  return (
    <div>
      <Container maxWidth="sm">
        <div className="button-container">
          <div className="button-wrap">
            <Button variant="contained" onClick={resetBingo}>리셋</Button>
          </div>
          <div className="button-wrap">
            <Button variant="contained" className="btn" onClick={cancleBingo}>취소</Button>
          </div>
        </div>
        <FormControlLabel className="check" control={<Checkbox checked={isInanna} onChange={handleInanna} style={{color:'white'}}/>} label="이난나" />
        <div className="message-desc">
          {`${round < 2 ? "초기 빙고" : `${round - 1}번째 폭탄`} 놓을 차례${(!isInanna) && (round % 3 === 1) && (round > 1)? " (무적용 빙고 해야됨!)" : ""}`}
        </div>
        <div className="message-warning">
          {`${warnMsg}`}
        </div>
        <div className="bingo-container">
          {BingoTableView}
        </div>
      </Container>
    </div>
  );
}

export default App;