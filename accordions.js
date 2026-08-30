// Renderers turn markdown text into a panel's HTML content.
const renderers = {
  // Blank-line-separated paragraphs.
  paragraphs(md, panel) {
    md.trim().split(/\n\s*\n/).forEach(para => {
      const p = document.createElement('p');
      p.className = 'about-text';
      p.textContent = para.trim();
      panel.appendChild(p);
    });
  },

  // Two columns marked by COL1: / COL2: in the source.
  columns(md, panel) {
    const pick = marker => (md.split(marker)[1] || '').split(/^COL\d:/m)[0].trim();
    ['COL1:', 'COL2:'].forEach((marker, i) => {
      const col = document.createElement('div');
      col.className = 'col' + (i + 1);
      col.textContent = pick(marker);
      panel.appendChild(col);
    });
  },

  // Day-by-day programme with time | title rows.
  schedule(md, panel) {
    let html = '';
    let inDay = false;
    for (const line of md.split('\n')) {
      if (line.startsWith('## ')) {
        if (inDay) html += '</div>';
        const title = line.replace('## ', '').toUpperCase();
        const dateMatch = title.match(/(\d+)\.(\d+)/);
        let pastClass = '';
        if (dateMatch) {
          const today = new Date();
          const eventDate = new Date(today.getFullYear(), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[1]));
          eventDate.setHours(23, 59, 59);
          if (eventDate < today) pastClass = ' past';
        }
        html += `<div class="day-block${pastClass}">${inDay ? '<hr>' : ''}<h2 class="day-title">${title}</h2>`;
        inDay = true;
      } else if (line.startsWith('- ')) {
        const content = line.replace('- ', '');
        const sep = content.indexOf(' | ');
        if (sep === -1) continue;
        html += `<div class="event-row"><span class="event-time">${content.slice(0, sep)}</span><span class="event-title">${content.slice(sep + 3)}</span></div>`;
      }
    }
    if (inDay) html += '</div>';
    panel.innerHTML = html;
  },
};

document.querySelectorAll('.accordion-panel').forEach(panel => {
  const toggle = panel.previousElementSibling;
  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open');
    panel.classList.toggle('open', isOpen);
  });

  const src = panel.dataset.src;
  if (!src) return;
  fetch(src)
    .then(r => r.text())
    .then(md => renderers[panel.dataset.render](md, panel));
});

fetch('footer.md')
  .then(r => r.text())
  .then(md => renderers.paragraphs(md, document.getElementById('footer')));

