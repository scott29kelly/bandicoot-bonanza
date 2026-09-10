/**
 * The HUD: four boxes in src/shell.html (fruit, crates, lives, checkpoint).
 * Paint-on-change only; the rules module calls paint(st) when a counter
 * moves. Lives inside #ui, so BB.setUI(false) hides it for captures.
 */
export function createHud(){
  const $=id=>document.getElementById(id);
  const el={
    root:$('hud'),
    fruit:$('fruit-count'),fruitTotal:$('fruit-total'),
    crates:$('crate-count'),crateTotal:$('crate-total'),
    lives:$('lives-count'),cp:$('cp-label')
  };
  const ok=Object.values(el).every(Boolean);
  function paint(st){
    if(!ok)return;
    el.fruit.textContent=st.fruit;
    el.fruitTotal.textContent=st.fruitTotal;
    el.crates.textContent=st.crates;
    el.crateTotal.textContent=st.crateTotal;
    el.lives.textContent=st.lives;
    el.cp.textContent=st.checkpoint<1?'START':'TOTEM '+st.checkpoint;
  }
  function show(on){if(el.root)el.root.classList.toggle('hidden',!on);}
  return {paint,show};
}
