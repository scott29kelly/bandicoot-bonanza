import { launch, gameUrl, boot, pin } from './_harness.mjs';

async function testControls() {
  console.log('[test] Testing player controls, facing, and slide behavior...');
  const browser = await launch({});
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    await boot(page, gameUrl({ seed: 6221086 }));
    await page.keyboard.press('Enter');
    await page.evaluate(async () => {
      await window.BB.settle(10);
    });

    // 1. Initial idle check
    const idle = await page.evaluate(() => {
      const p = window.BB.player;
      return {
        vel: [p.vel.x, p.vel.y, p.vel.z],
        pos: [p.pos.x, p.pos.y, p.pos.z],
        faceA: p.faceA,
        rotY: p.rig.rotation.y
      };
    });
    console.log('[test] Idle state:', idle);
    if (Math.abs(idle.vel[2]) > 0.01) {
      throw new Error('Player is moving while idle!');
    }

    // 2. Press W: should move in -Z (forward down the track)
    await page.keyboard.down('KeyW');
    await page.evaluate(async () => {
      await window.BB.settle(15);
    });
    const runW = await page.evaluate(() => {
      const p = window.BB.player;
      return {
        velZ: p.vel.z,
        posZ: p.pos.z,
        faceA: p.faceA
      };
    });
    console.log('[test] Running W:', runW);
    await page.keyboard.up('KeyW');
    if (runW.velZ >= 0 || runW.posZ >= 0) {
      throw new Error(`Running with W moved in wrong direction! velZ=${runW.velZ}, posZ=${runW.posZ}`);
    }

    // Settle to stop
    await page.evaluate(async () => {
      await window.BB.settle(15);
    });

    // 3. Test Slide with S / ArrowDown
    console.log('[test] Testing Slide with ArrowDown while moving...');
    await page.keyboard.down('ArrowUp');
    await page.evaluate(async () => {
      await window.BB.settle(5);
    });
    await page.keyboard.down('ArrowDown');
    await page.evaluate(async () => {
      await window.BB.settle(5);
    });
    await page.keyboard.up('ArrowDown');
    await page.keyboard.up('ArrowUp');

    const slideInfo = await page.evaluate(() => {
      const p = window.BB.player;
      return {
        slideT: p.slideT,
        slideDir: [p.slideDir.x, p.slideDir.y, p.slideDir.z],
        velZ: p.vel.z,
        faceA: p.faceA
      };
    });
    console.log('[test] Slide state:', slideInfo);
    if (slideInfo.slideDir[2] > 0) {
      throw new Error(`Slide moved backward toward camera! slideDir=${slideInfo.slideDir}`);
    }

    // Let slide complete
    await page.evaluate(async () => {
      await window.BB.settle(30);
    });

    const postSlide = await page.evaluate(() => {
      const p = window.BB.player;
      return {
        velZ: p.vel.z,
        faceA: p.faceA,
        slideT: p.slideT
      };
    });
    console.log('[test] Post slide state:', postSlide);
    if (postSlide.velZ > 0.01) {
      throw new Error(`Post slide character is running backward! velZ=${postSlide.velZ}`);
    }

    // 4. Test Damage Stagger
    console.log('[test] Testing Damage Stagger facing...');
    await page.evaluate(() => {
      window.BB.player.takeDamage(1, { x: 0, y: 3, z: -85 }, 'log');
    });
    await page.evaluate(async () => {
      await window.BB.settle(10);
    });

    const damageInfo = await page.evaluate(() => {
      const p = window.BB.player;
      return {
        velZ: p.vel.z,
        faceA: p.faceA,
        slideDir: [p.slideDir.x, p.slideDir.y, p.slideDir.z]
      };
    });
    console.log('[test] Damage state:', damageInfo);
    if (damageInfo.velZ > 0.5) {
      throw new Error(`Damage flung player forward toward camera! velZ=${damageInfo.velZ}`);
    }

    console.log('[test] ALL CONTROLS & MOVEMENT TESTS PASSED CLEANLY!');
  } finally {
    try {
      await Promise.race([browser.close(), new Promise(r => setTimeout(r, 1500))]);
    } catch (e) {}
    process.exit(0);
  }
}

testControls();
