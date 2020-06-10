import {DataSignal} from '@src/util/data';
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

type State = LoggedInResponse | LoggedOutResponse | null;

/**
 * The current authentication state: logged in, logged out, or unknown.
 */
export const authState = new DataSignal<State>(null);


/**
 * Retrieves the current login state from the server.
 */
async function updateState() {
  const response = await fetch('/api/users/me');
  const newState =
    await response.json() as LoggedInResponse | LoggedOutResponse;
  authState.setValue(newState);
}

/**
 * Launches the login flow.
 */
export function login() {
  const currentState = authState.getValue();

  if (currentState && 'loginUri' in currentState) {
    const loginDialog = window.open(currentState.loginUri);

    if (loginDialog === null) {
      throw new Error('popup blocker');
    }
  }
}

/**
 * Logs the user out.
 *
 * @returns `true` if the user was logged out, `false` if they were not logged
 * in.
 */
export async function logout(): Promise<boolean> {
  const currentState = authState.getValue();

  if (currentState && 'logoutUri' in currentState) {
    // we don't even need to open the window to log out, so don't
    await fetch(currentState.logoutUri);
    await updateState();
    return true;
  }

  return Promise.resolve(false);
}

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

  window.addEventListener('auth-login', () => updateState());
  window.addEventListener('auth-logout', () => updateState());

  function onStateChange(newState: State) {
    container.innerHTML = '';

    if (newState === null) {
      container.classList.toggle('loading', true);
      container.append(loadingContent);
      return;
    }

    container.classList.toggle('loading', false);

    if ('loginUri' in newState) {
      container.append(loggedOutContent);
      return;
    }

    if ('logoutUri' in newState) {
      container.append(loggedInContent);
      return;
    }

    throw new Error('unexpected state');
  }

  authState.addHandler(onStateChange);

  onStateChange(authState.getValue());

  void updateState();

  return {
    root: container,
  };
};
