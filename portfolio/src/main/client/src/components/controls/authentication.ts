import {htmlElement} from '@src/util/html';

interface LoggedInResponse {
  logoutUri: string;
  id: string;
  username: string;
  role: 'admin' | 'user';
}

interface LoggedOutResponse {
  loginUri: string;
}

type State = LoggedInResponse | LoggedOutResponse;

/**
 * The current authentication state.
 */
export let authState: State | null = null;

/**
 * Retrieves the current login state from the server.
 */
async function fetchState() {
  const response = await fetch('/api/users/me');
  authState = await response.json() as State;
  window.dispatchEvent(new CustomEvent('auth-state-change', {detail: authState}));
}

/**
 * Launches the login flow.
 *
 * @returns A Promise which resolves when the login is complete. Resolves to
 * `true` if the user was logged in, `false` if they were not logged out.
 */
export function login(): Promise<boolean> {
  if (authState && 'loginUri' in authState) {
    const loginDialog = window.open(authState.loginUri);

    if (loginDialog === null) {
      throw new Error('popup blocker');
    }

    return new Promise((resolve, reject) => {
      window.addEventListener(
        'auth-login',
        async () => {
          try {
            await fetchState();
            resolve(true);
          } catch (err) {
            reject(err);
          }
        },
        {once: true}
      );
    });
  }

  return Promise.resolve(false);
}

/**
 * Logs the user out.
 *
 * @returns `true` if the user was logged out, `false` if they were not logged
 * in.
 */
export async function logout(): Promise<boolean> {
  if (authState && 'logoutUri' in authState) {
    // we don't even need to open the window to log out, so don't
    await fetch(authState.logoutUri);
    await fetchState();
    return true;
  }

  return Promise.resolve(false);
}

void fetchState();

/**
 * An authentication control, which is a button that says 'Log in' if
 * the user is logged out and vice versa. Clicking the button will allow the
 * user to sign in and out.
 */
export const Authentication = () => {
  const container = document.createElement('div');
  container.classList.add('auth-container');

  const loadingContent =
    htmlElement`<span>Loading...</span>`;

  const loggedOutContent: HTMLButtonElement =
    htmlElement`<button type="button">Log in</button>`;


  const loggedInContent: HTMLButtonElement =
    htmlElement`<button type="button">Log out</button>`;

  loggedOutContent.addEventListener('click', () => login());
  loggedInContent.addEventListener('click', () => logout());

  const onStateChange = () => {
    container.innerHTML = '';

    if (authState === null) {
      container.classList.toggle('loading', true);
      container.append(loadingContent);
      return;
    }

    container.classList.toggle('loading', false);

    if ('loginUri' in authState) {
      container.append(loggedOutContent);
      return;
    }

    if ('logoutUri' in authState) {
      container.append(loggedInContent);
      return;
    }

    throw new Error('unexpected state');
  };

  onStateChange();
  window.addEventListener('auth-state-change', onStateChange);

  return {
    root: container,
  };
};
