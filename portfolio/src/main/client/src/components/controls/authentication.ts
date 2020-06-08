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
 * Retrieves the current login state from the server.
 *
 * @param state The state data signal.
 */
async function updateState(state: DataSignal<State>) {
  const response = await fetch('/api/users/me');
  const newState =
    await response.json() as LoggedInResponse | LoggedOutResponse;
  state.value = newState;
}

/**
 * Launches the login flow.
 *
 * @param state The state data signal.
 */
function login(state: DataSignal<State>) {
  const currentState = state.value;
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
 * @param state The state data signal.
 */
function logout(state: DataSignal<State>) {
  const currentState = state.value;
  if (currentState && 'logoutUri' in currentState) {
    // we don't even need to open the window to log out, so don't
    void fetch(currentState.logoutUri)
      .then(() => updateState(state))
      .catch((err) => console.error(err));
  }
}

/**
 * An authentication control, which is a button that says 'Log in' if
 * the user is logged out and vice versa. Clicking the button will allow the
 * user to sign in and out.
 */
export const Authentication = () => {
  const state = new DataSignal<State>(null);
  const container = document.createElement('div');
  container.classList.add('auth-container');

  const loadingContent =
    htmlElement`<span>Loading...</span>`;

  const loggedOutContent: HTMLButtonElement =
    htmlElement`<button type="button">Log in</button>`;

  loggedOutContent.addEventListener('click', () => login(state));

  const loggedInContent: HTMLButtonElement =
    htmlElement`<button type="button">Log out</button>`;

  loggedInContent.addEventListener('click', () => logout(state));

  window.addEventListener('auth-login', () => {
    void updateState(state);
  });

  window.addEventListener('auth-logout', () => {
    void updateState(state);
  });

  function handle(newState: State) {
    if (newState === null) {
      container.classList.toggle('loading', false);
      container.innerHTML = '';
      container.append(loadingContent);
      return;
    }

    if ('loginUri' in newState) {
      container.classList.toggle('loading', false);
      container.innerHTML = '';
      container.append(loggedOutContent);
      return;
    }

    if ('logoutUri' in newState) {
      container.classList.toggle('loading', false);
      container.innerHTML = '';
      container.append(loggedInContent);
      return;
    }

    throw new Error('unexpected state');
  }

  state.on(handle);

  handle(state.value);

  void updateState(state);

  return {
    state,
    render(): HTMLElement {
      return container;
    },
  };
};
