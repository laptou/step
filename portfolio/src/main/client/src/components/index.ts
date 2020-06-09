import {Renderable} from '@src/util/html';

/**
 * Extend this class to create a component.
 */
export interface Component {
  readonly content: Renderable;
}
