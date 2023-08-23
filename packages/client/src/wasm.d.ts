declare const Module: {
  layoutGraph: (
    vertCount: number,
    edges: number[],
    names: string[]
  ) => {
    vert: number[][][]
    edge: [number, number][][]
  }
}
