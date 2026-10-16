(function(root) {
  'use strict';
  const platforms = ['luogu','codeforces','qoj'];
  function toState(data, now=Date.now()/1000) {
    if (data.schema_version !== 1 || !Array.isArray(data.members) || !Array.isArray(data.accounts) || !Array.isArray(data.solves) || !Array.isArray(data.activity)) throw Error('仓库数据格式不兼容');
    const today = Math.floor((now+28800)/86400)*86400-28800;
    const start = today-6*86400;
    const solves = data.solves;
    const members = data.members.map(m=> {
      const records = solves.filter(s=>s.member_id===m.id);
      const accounts=data.accounts.filter(a=>a.member_id===m.id);
      const counts=Object.fromEntries(platforms.map(p=>{const a=accounts.find(a=>a.platform===p);return [p,a?.inventory_total??records.filter(s=>s.platform===p).length];}));
      const week=records.filter(s=>s.solved_at!==null && s.solved_at>=start && s.solved_at<=now);
      return {...m, accounts, total:platforms.reduce((sum,p)=>sum+counts[p],0), collected:records.length,
        total_partial:accounts.some(a=>a.inventory_total==null&&!a.complete),
        today:records.filter(s=>s.solved_at!==null && s.solved_at>=today && s.solved_at<=now).length,
        weekly_platforms:Object.fromEntries(platforms.map(p=>[p,week.filter(s=>s.platform===p).length])),
        weekly:records.filter(s=>s.solved_at!==null && s.solved_at>=start && s.solved_at<=now).length,
        platforms:counts,
        problem_samples:platforms.flatMap(p=>records.filter(s=>s.platform===p).sort((a,b)=>(b.solved_at||0)-(a.solved_at||0)||b.problem_id.localeCompare(a.problem_id)).slice(0,2))};
    });
    const trend = Array.from({length:7},(_,i)=> {
      const day=start+i*86400;
      return {date:new Date((day+28800)*1000).toISOString().slice(5,10).replace('-','.'),count:solves.filter(s=>s.solved_at!==null && s.solved_at>=day && s.solved_at<day+86400 && s.solved_at<=now).length};
    });
    return {...data, members, total:solves.length, weekly:trend.reduce((n,r)=>n+r.count,0), trend,
      unknown_dates:solves.filter(s=>s.solved_at===null).length, now, week_start:start, events:[], recent:[]};
  }
  const api={toState}; root.BoardData=api;
  if(typeof module!=='undefined') module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
