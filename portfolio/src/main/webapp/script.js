// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** @typedef {'light' | 'dark'} ThemeMode */

class ThemeState {
  /** @type {ThemeMode} */
  mode = 'light';
  /** @type {HTMLLinkElement} */
  el = document.getElementById('theme-link');

  /**
   * Updates the theme to the given mode
   * @param {ThemeMode} mode
   */
  update(mode) {
    this.el.href = `/style.${mode}.css`;
    this.mode = mode;
  }

  /**
   * Switches theme from light to dark or vice versa.
   */
  toggle() {
    if (this.mode === 'light')
      this.update('dark');
    else
      this.update('light');
  }
}

let state = {
  theme: new ThemeState()
};


document
  .getElementById('theme-toggle')
  .addEventListener('click', () => state.theme.toggle());
