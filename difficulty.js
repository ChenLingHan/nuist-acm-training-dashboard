(function (root) {
  const luoguNames = ['暂无评定','入门','普及−','普及','普及+ / 提高−','提高','提高+ / 省选−','省选 / NOI−','NOI / NOI+ / CTS'];
  const luoguColors = ['#9ba7ba','#ef8880','#efb671','#eddb78','#9ed77f','#66d9d2','#76b5ed','#bb9ae7','#c4cbd7'];
  // Dashboard palette for problem ratings; not a conversion to Luogu difficulty.
  const cfBands = [
    {min:0,max:1200,label:'<1200',color:'#adb7c7'},
    {min:1200,max:1400,label:'1200–1399',color:'#9ed77f'},
    {min:1400,max:1600,label:'1400–1599',color:'#66d9d2'},
    {min:1600,max:1900,label:'1600–1899',color:'#7ca8ff'},
    {min:1900,max:2100,label:'1900–2099',color:'#bb9ae7'},
    {min:2100,max:2400,label:'2100–2399',color:'#efb671'},
    {min:2400,max:3000,label:'2400–2999',color:'#ef8880'},
    {min:3000,max:Infinity,label:'≥3000',color:'#f1da80'}
  ];
  function describe(platform, value) {
    if (value === null || value === undefined || platform === 'qoj') return {color:'#9ba7ba',label:'未评级'};
    if (platform === 'luogu') return {color:luoguColors[value] || '#9ba7ba',label:luoguNames[value] || '未知等级'};
    const band = cfBands.find(b => value >= b.min && value < b.max);
    return {color:band?.color || '#9ba7ba',label:`CF ${value}`};
  }
  const api = {describe,cfBands,luoguNames,luoguColors};
  if (typeof module !== 'undefined') module.exports = api;
  else root.BoardDifficulty = api;
})(typeof window === 'undefined' ? this : window);
