(function () {
  if (window.hasSelectionAnchorInjected) return;
  window.hasSelectionAnchorInjected = true;

  let startRange = null;

  // Create floating trigger button
  const btn = document.createElement('button');
  btn.id = 'sel-anchor-fab';
  btn.innerText = 'Set Start';
  document.body.appendChild(btn);

  // Non-blocking status feedback
  function showToast(text) {
    const toast = document.createElement('div');
    toast.className = 'sel-anchor-toast';
    toast.innerText = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }

  // Prevent button taps from clearing the active DOM text selection
  btn.addEventListener('mousedown', (e) => e.preventDefault());
  btn.addEventListener('touchstart', (e) => e.preventDefault());

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const sel = window.getSelection();

    if (!startRange) {
      // Step 1: Lock Start Anchor
      if (sel.rangeCount > 0 && !sel.isCollapsed) {
        startRange = sel.getRangeAt(0).cloneRange();
        btn.innerText = 'Set End';
        btn.classList.add('active');
        showToast('Start anchor locked');
      } else {
        showToast('Highlight a word first!');
      }
    } else {
      // Step 2: Lock End Anchor & Bridge Range
      if (sel.rangeCount > 0 && !sel.isCollapsed) {
        const endRange = sel.getRangeAt(0);
        const finalRange = document.createRange();

        try {
          // Compare node positions in the DOM tree
          if (startRange.compareBoundaryPoints(Range.START_TO_START, endRange) <= 0) {
            finalRange.setStart(startRange.startContainer, startRange.startOffset);
            finalRange.setEnd(endRange.endContainer, endRange.endOffset);
          } else {
            // Handles reverse selection (bottom-to-top)
            finalRange.setStart(endRange.startContainer, endRange.startOffset);
            finalRange.setEnd(startRange.endContainer, startRange.endOffset);
          }

          sel.removeAllRanges();
          sel.addRange(finalRange);
          showToast('Selection complete!');
        } catch (err) {
          showToast('Selection failed across structural nodes');
        }

        // Reset state
        startRange = null;
        btn.innerText = 'Set Start';
        btn.classList.remove('active');
      } else {
        showToast('Highlight an end word first!');
      }
    }
  });
})();
