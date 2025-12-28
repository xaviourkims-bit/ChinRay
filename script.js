function bloomLoop(segs) {
  const tips = getBranchTips(segs);
  function loop() {
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(treeOffsetX, 0); // apply drift offset

    drawGround();
    segs.forEach(drawSeg);

    // Spawn blooms every frame for faster blooming
    spawnBloom(tips);

    // Animate blooms
    for (let i = blooms.length - 1; i >= 0; i--) {
      const b = blooms[i];
      b.y += b.vy;
      b.x += (Math.random() - 0.5) * 0.5;
      b.life -= 0.015;
      drawBloom(b);
      if (b.life <= 0) blooms.splice(i, 1);
    }

    ctx.restore();

    requestAnimationFrame(loop);
  }
  loop();
}

async function animateTree(segs) {
  for (let i = 0; i < segs.length; i++) {
    await new Promise(res => {
      const start = performance.now();
      const dur = 16;
      function frame(now) {
        const t = Math.min((now - start) / dur, 1);
        ctx.clearRect(0, 0, width, height);
        drawGround();
        segs.slice(0, i).forEach(drawSeg);
        drawSeg(segs[i]);
        t < 1 ? requestAnimationFrame(frame) : res();
      }
      requestAnimationFrame(frame);
    });
  }
}

// 🌟 Drift starts only after growth finishes
function startDrift() {
  function drift() {
    if (treeOffsetX > -80) { // limit drift
      treeOffsetX -= 0.05;   // gentle left drift
      requestAnimationFrame(drift);
    }
  }
  drift();
}

seedBtn.onclick = async () => {
  // Animate button falling instead of hiding
  let pos = 110; // starting top position
  const groundY = height - 80; // ground line (slightly above canvas ground)

  function fall() {
    pos += 5; // fall speed
    seedBtn.style.top = pos + "px";
    if (pos < groundY) {
      requestAnimationFrame(fall);
    } else {
      seedBtn.style.top = groundY + "px"; // snap to ground
    }
  }
  fall();

  // Continue with tree animation
  const segs = [];
  const startX = width / 2;
  const startY = height - 40;
  const trunkLen = height * 0.3;
  generateTree(startX, startY, trunkLen, -Math.PI / 2, 24, segs, 0);
  await animateTree(segs);
  bloomLoop(segs);
  nextLine();
};
