import {htmlElement, htmlFragment} from '@src/util/html';

export interface LabeledInputOptions {
  /**
   * The label. Will be shown as a placeholder when the textbox is empty, and
   * shown as a label otherwise.
   */
  label: string;

  /**
   * The ID to apply to the input or textarea.
   */
  id: string;

  /**
   * Whether the label will disappear automatically when the input is empty.
   * Does not apply to textareas, since they do not support placeholders.
   * Defaults to true.
   */
  soft?: boolean;

  /**
   * The name of the input or textarea.
   */
  name?: string;

  /**
   * The class name of the input or textarea.
   */
  className?: string;

  /**
   * The type of input to create.
   */
  type?: 'text' | 'number' | 'email' | 'textarea';

  /**
   * A predefined value to put in the input or textarea.
   */
  value?: string;
}

/**
 * @returns A labeled input, which is just a label followed by an input or
 * textarea. This is designed to be used with textual inputs: when the input is
 * empty, the label may disappear and be used as a placeholder instead.
 */
export const LabeledInput =
  ({
    name, id, className, label, type, value, soft,
  }: LabeledInputOptions): Node[] => {
    const labelEl: HTMLLabelElement =
      htmlElement`<label for="${id}" class="input-label">${label}</label>`;

    if (soft !== false) labelEl.classList.add('soft');
    if (!value) labelEl.classList.add('empty');

    const inputEl: HTMLInputElement | HTMLTextAreaElement =
      type === 'textarea' ?
        htmlElement`<textarea id="${id}" 
                              name="${name}" 
                              placeholder="${label}">${value}</textarea>` :
        htmlElement`<input id="${id}"
                           class="${className}"
                           name="${name}" 
                           type="${type ?? 'text'}"
                           value="${value}"
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

    return htmlFragment`${labelEl}${inputEl}`;
  };
