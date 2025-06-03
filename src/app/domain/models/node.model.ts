/**
 * Node model (elements) of the diagram
 * @description Node model for the diagram
 * @interface Node
 * @property {string} id - The id of the node
 * @property {string} type - The type of the node
 * @property {object} data - The data of the node
 * @property {object} position - The position of the node
 */
export interface Node {
  id: string;
  type: string;
  data: {
    label: string;
    properties?: string[];
    methods?: string[];
    stereotype?: string;
    visibility?: string;
    lifeline?: boolean;
    activation?: boolean;
    package?: string;
    actor?: boolean;
    usecase?: boolean;
    component?: boolean;
    isInterface?: boolean;
    color?: {
      bg: string;
      border: string;
    };
  };
  position: {
    x: number;
    y: number;
  };
}
