/** Site-wide 5% paper grain: generated once, tiled, never intercepts input. */
export function installGrain() {
  if (typeof document === 'undefined' || document.querySelector('.pm-grain')) return
  try {
    const c = document.createElement('canvas')
    c.width = c.height = 160
    const x = c.getContext('2d')
    if (!x) return
    const img = x.createImageData(160, 160)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 255
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    x.putImageData(img, 0, 0)
    const el = document.createElement('div')
    el.className = 'pm-grain'
    el.setAttribute('aria-hidden', 'true')
    el.style.backgroundImage = `url(${c.toDataURL()})`
    document.body.appendChild(el)
  } catch {
    /* decorative only */
  }
}
