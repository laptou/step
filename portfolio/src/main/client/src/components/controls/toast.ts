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
 * Creates a timed toast and places it in the toast container. 
 * @param el The HTML element which represents this toast.
 * @param info The state associated with this toast.
 */
function initTimedToast(
  el: HTMLElement,
  info: ToastInfo
) {
  const toastTimer: SVGCircleElement =
    document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  toastTimer.setAttribute('pathLength', '100');
  toastTimer.setAttribute('cx', '12');
  toastTimer.setAttribute('cy', '12');
  toastTimer.setAttribute('r', '12');

  const toastSvg =
    document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  toastSvg.classList.add('toast-timer');
  toastSvg.setAttribute('viewBox', '0 0 24 24');
  toastSvg.append(toastTimer);

  el.append(toastSvg);

  el.addEventListener('mouseover', () => {
    if (info.timeout) {
      info.paused = true;
    }
  });

  el.addEventListener('mouseout', () => {
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
      el.dispatchEvent(new Event('toast-dismissed'));
      return;
    }

    const percent = info.remaining / info.timeout * 100;

    toastTimer.style.strokeDasharray = `${percent} ${100 - percent}`;

    requestAnimationFrame(animateToast);

    lastFrame = frame;
  }

  requestAnimationFrame(animateToast);
}

/**
 * Creates a modal toast and places it in the toast container. 
 * @param el The HTML element which represents this toast.
 * @param info The state associated with this toast.
 */
function initModalToast(
  el: HTMLElement
) {
  const toastDismiss: HTMLButtonElement =
    htmlElement`
    <button type="button" class="toast-dismiss">
      Dismiss
    </button>`;

  el.append(toastDismiss);

  toastDismiss.addEventListener('click', () => {
    el.dispatchEvent(new Event('toast-dismissed'));
  });
}

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

  const toast =
    htmlElement`
    <li class="toast toast-${kind} toast-created">
      <div class="toast-content">
        ${new Text(message)}
      </div>
    </li>`;

  if (info.timeout !== false) {
    initTimedToast(toast, info);
  } else {
    initModalToast(toast);
  }

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
