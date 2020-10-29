'use strict';
const fs = require('fs');
const readline = require('readline');
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });

const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト
rl.on('line', (lineString) => {

//読み込んだデータを配列にする
  const columns = lineString.split(',');
//配列０番目はyear
  const year = parseInt(columns[0]);
  const prefecture = columns[1];
  const popu = parseInt(columns[3]);
//→配列は[year,prefecture,popu]になる

//もしyearが2010か2015だったら＝一行目じゃなかったら
//prefecture（配列１番目（都道府県）の値を取ってくる）
  if (year === 2010 || year === 2015) {
    let value = prefectureDataMap.get(prefecture);//都道府県をキーにして集計データのオブジェクトを取ってくる
    if (!value) {
      value = {
        popu10: 0,
        popu15: 0,
        change: null
      };
    }
    if (year === 2010) {
      value.popu10 = popu;
    }
    if (year === 2015) {
      value.popu15 = popu;
    }
    prefectureDataMap.set(prefecture, value);
  }
});
rl.on('close', () => {
    //prefectureDataMap（Map関数）の中身をkeyとvalueに代入する
    for(let[key,value] of prefectureDataMap){
        value.change = value.popu15/value.popu10;
    }
    //渡した配列の中から２つの数を選んできてそれをpair1とpair2に代入して return pair2 - pair1 を返すことでそれが正か負かによって並び替えを行う
    //Array.from(prefectureDataMap)によって連想配列が配列に変わる
    //その中身は二次元配列になっており [['北海道',{popu10:500, popu15:600 ,change:0.6}]]の様になっていて
    //配列の0番目に都道府県、1番目に人口データのオブジェクトが入る
    const rankingArray = Array.from(prefectureDataMap).sort((pair1,pair2) =>{
        //二次元配列の1番目の人口データのオブジェクトの中のchange(変化率)の値
        return pair2[1].change-pair1[1].change;
    });
    const rankingStrings = rankingArray.map(([key,value])=>{
        //return key + ':' + value.popu10 + '=>' +value.popu15 + '変化率：' + value.change;
        return `${key}: ${value.popu10} -> ${value.popu15} 変化率：${value.change}`
    })
  console.log(rankingStrings);
});