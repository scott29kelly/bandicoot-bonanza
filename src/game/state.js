/**
 * Game mode. REVIEW freezes gameplay (input, camera follow) so the harness
 * owns the frame; the world clock keeps running so nothing is frozen jelly.
 */
export function createState(){
  return {
    mode:'PLAY',
    enterReview(){this.mode='REVIEW';}
  };
}
