// Tiny DOM helpers shared by every view: build elements without innerHTML, so guide text is always inserted as text.

/**
 * Create an element. `props` may hold class, text, dataset, attrs, on (event map) and any DOM property.
 * Children may be strings, nodes, arrays of either, or null/false (skipped).
 */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'attrs') for (const [a, v] of Object.entries(value)) { if (v != null && v !== false) node.setAttribute(a, v === true ? '' : String(v)); }
    else if (key === 'on') for (const [type, handler] of Object.entries(value)) node.addEventListener(type, handler);
    else node[key] = value;
  }
  appendChildren(node, children);
  return node;
}

export function appendChildren(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** Replace everything inside `node` with `children`. */
export function mount(node, ...children) {
  node.replaceChildren();
  return appendChildren(node, children);
}

export const byId = (id) => document.getElementById(id);

/** Small inline SVG icon by name, drawn with currentColor. */
export function icon(name) {
  const paths = {
    check: 'M3 8.5l3.2 3.2L13 5',
    lock: 'M4.5 7V5.5a3.5 3.5 0 017 0V7M3.5 7h9v6.5h-9z',
    eye: 'M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8zM8 6a2 2 0 100 4 2 2 0 000-4z',
    flag: 'M3.5 14V2.5M3.5 3h8l-1.8 2.8L11.5 8.5h-8',
    link: 'M6.5 9.5l3-3M5 7.5L3.6 8.9a2.4 2.4 0 003.4 3.4L8.5 11M11 8.5l1.4-1.4a2.4 2.4 0 00-3.4-3.4L7.5 5',
    split: 'M8 2v12M3 5h3M3 8h3M10 8h3M10 11h3',
  };
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('class', `icon icon-${name}`);
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', paths[name] ?? '');
  svg.append(path);
  return svg;
}
