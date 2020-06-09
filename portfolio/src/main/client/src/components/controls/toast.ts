import {htmlElement} from '@src/util/html';
import '@res/style/controls/toast.scss';

type ToastKind = 'info' | 'error';

interface ToastInfo {
  message: string;
  kind: 'info' | 'error';

  timeout: number | false;
  remaining: number | false;
  paused: boolean;
  dismissed: boolean;
}

const container = htmlElement`<ul id="toast-container"></ul>`;

/**
 * Shows a toast message.
 *
 * @param message The message to show.
 * @param kind The kind of toast to show.
 * @param timeout The amount of time before the toast should disappear. Specify
 * `false` if the toast should not disappear automatically.
 * @returns A Promise which resolves when the toast is dismissed.
 */
export function showToast(
  message: string,
  kind: ToastKind,
  timeout: number | false = 7000): Promise<void> {
  const info: ToastInfo = {
    message,
    kind,
    timeout,
    remaining: timeout,
    paused: false,
    dismissed: false,
  };

  const toastTimer: SVGCircleElement =
    document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  toastTimer.setAttribute('pathLength', '100');
  toastTimer.setAttribute('cx', '12');
  toastTimer.setAttribute('cy', '12');
  toastTimer.setAttribute('r', '12');

  const toast =
    htmlElement`
    <li class="toast toast-${kind} toast-created">
      <div class="toast-content">
        ${new Text(message)}
      </div>
      <svg class="toast-timer" viewBox="0 0 24 24">
        ${toastTimer}
      </svg>
    </li>`;

  toast.addEventListener('mouseover', () => {
    if (info.timeout) {
      info.paused = true;
    }
  });

  toast.addEventListener('mouseout', () => {
    info.paused = false;
  });

  let lastFrame: DOMHighResTimeStamp | null = null;

  function animateToast(frame: DOMHighResTimeStamp) {
    if (info.timeout === false || info.remaining === false) {
      return;
    }

    const delta = lastFrame ? frame - lastFrame : 0;

    if (!info.paused) {
      info.remaining -= delta;
    }

    if (info.remaining < 0) {
      toast.dispatchEvent(new Event('toast-dismissed'));
      return;
    }

    const percent = info.remaining / info.timeout * 100;

    toastTimer.style.strokeDasharray = `${percent} ${100 - percent}`;

    requestAnimationFrame(animateToast);

    lastFrame = frame;
  }

  requestAnimationFrame(animateToast);

  container.append(toast);

  // for CSS transition
  // disable transition, then let it spring up
  toast.style.transition = 'none';
  toast.style.marginBottom = `-${toast.getBoundingClientRect().height}px`;
  toast.classList.toggle('toast-created', true);

  setTimeout(() => {
    toast.style.transition = '';
    toast.style.marginBottom = '';
    toast.classList.toggle('toast-created', false);
  }, 100);

  toast.addEventListener(
    'toast-dismissed',
    () => {
      toast.style.marginBottom = `-${toast.getBoundingClientRect().height}px`;
      toast.classList.toggle('toast-dismissed', true);
    },
    {once: true});

  return new Promise((resolve) => {
    toast.addEventListener('toast-dismissed', () => resolve(), {once: true});
  });
}

export const Toast = (): HTMLElement => container;

setTimeout(() =>
  void showToast(`hello this is a test ajklsdfjsadfkjd
asdfjjs
sidofa
asdfosapidfas
oiaspdfiadf
iopasdfk`, 'info', 10000), 2000);
setTimeout(() =>
  void showToast(`hello this is a test ajklsdfjsadfkjd
asdfjjs
sidofa
asdfosapidfas
oiaspdfiadf
iopasdfk`, 'error', 10000), 3000);
setTimeout(() =>
  void showToast(`hello this is a test ajklsdfjsadfkjd
asdfjjs
sidofa
asdfosapidfas
oiaspdfiadf
iopasdfk`, 'info', 10000), 5000);
