/**
 * Edge model (connections) of the diagram
 * @description Edge model for the diagram
 * @interface Edge
 * @property {string} id - The id of the edge
 * @property {string} source - The id of the source node
 * @property {string} target - The id of the target node
 * @property {string} type - The type of the edge
 * @property {string} label - The label of the edge
 */
export interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  animated?: boolean;
  message?: string;
  stereotype?: string;
  multiplicity?: {
    source?: string;
    target?: string;
  };
}
