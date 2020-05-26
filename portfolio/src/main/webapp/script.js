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

let state = {
  theme: {
    /** @type {ThemeMode} */
    mode: 'light', 
    /** @type {HTMLLinkElement} */
    el: document.getElementById('theme-link') 
  }
};

/**
 * @param {ThemeMode} mode
 */
function updateTheme(mode) {
  console.debug(`changing theme to ${mode}`);

  state.theme.el.href = `/style.${mode}.css`;
  state.theme.mode = mode;
}

function toggleTheme() {
  if (state.theme.mode === 'light')
    updateTheme('dark');
  else
    updateTheme('light');
}

document.getElementById('theme-toggle')
    .addEventListener('click', toggleTheme);