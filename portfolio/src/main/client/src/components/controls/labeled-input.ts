import {htmlElement, htmlFragment} from '@src/util/html';

export interface LabeledInputOptions {
  label: string;
  id: string;

  /**
   * Whether the label will disappear automatically when the input is empty.
   * Does not apply to textareas, since they do not support placeholders.
   * Defaults to true.
   */
  soft?: boolean;
  name?: string;
  className?: string;
  type?: 'text' | 'number' | 'email' | 'textarea';

  value?: string;
}


export type LabeledInputComponent =
  [HTMLLabelElement, HTMLInputElement | HTMLTextAreaElement];

export const LabeledInput =
  ({
    name, id, className, label, type, value, soft,
  }: LabeledInputOptions): LabeledInputComponent => {
    const labelEl: HTMLLabelElement =
      htmlElement`<label for="${id}" class="input-label">${label}</label>`;

    if (soft !== false) labelEl.classList.add('soft');
    if (!value) labelEl.classList.add('empty');

    const inputEl: HTMLInputElement | HTMLTextAreaElement =
      type === 'textarea' ?
        htmlElement`<textarea id="${id}" 
                              name="${name}" 
                              placeholder="${label}"></textarea>` :
        htmlElement`<input id="${id}"
                           class="${className}"
                           name="${name}" 
                           type="${type ?? 'text'}" 
                           placeholder="${label}" />`;

    inputEl.addEventListener('focus', () => labelEl.classList.add('focused'));
    inputEl.addEventListener('blur', () => labelEl.classList.remove('focused'));
    inputEl.addEventListener('input', () => {
      const empty = !inputEl.value;
      if (empty) {
        labelEl.classList.add('empty');
      } else {
        labelEl.classList.remove('empty');
      }
    });

    return htmlFragment`${labelEl}${inputEl}` as LabeledInputComponent;
  };
